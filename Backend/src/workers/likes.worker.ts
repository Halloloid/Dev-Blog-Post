import { redis } from "../config/redis.js";
import { prisma } from "../config/db.js";

const STREAM_KEY = "likes:events";
const GROUP = "likes-group";
const CONSUMER = "likes-worker-1";
const MAX_BATCH_SIZE = 200;
const FLUSH_WINDOW_MS = 4000;
const POLL_BLOCK_MS = 1000;


function parseXReadGroupResponse(raw: unknown): LikeEvent[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const res = raw as [string, [string, Record<string, string> | string[]][]][];
  const [, entries] = res[0];

  return entries.map(([id, data]) => {
    const fields = fieldsToObject(data as any);
    return {
      id,
      postId: fields.postId,
      userId: fields.userId,
      action: fields.action as "like" | "unlike",
    };
  }).filter(e => e.postId && e.userId && (e.action === "like" || e.action === "unlike"));
}


const ensureGroup = async () => {
    try {
        await redis.xgroup(STREAM_KEY, {
            type: "CREATE",
            group: GROUP,
            id: "$",
            options: { MKSTREAM: true }
        });
    } catch (error: any) {
        // checking if the group already exists
        if (!String(error).includes("BUSYGROUP")) throw error;
    }
}

type LikeEvent = {
    id: string,
    postId: string,
    userId: string,
    action: "like" | "unlike"
};

function fieldsToObject(data: Record<string, string> | string[]): Record<string, string> {
    if (Array.isArray(data)) {
        const obj: Record<string, string> = {};
        for (let i = 0; i < data.length; i += 2) {
            obj[String(data[i])] = String(data[i + 1]);
        }
        return obj;
    }
    return data;
}


const readBatch = async (count = MAX_BATCH_SIZE, blockMs = POLL_BLOCK_MS): Promise<LikeEvent[]> => {
    const raw = await redis.xreadgroup(
        GROUP,
        CONSUMER,
        STREAM_KEY,
        ">",
        {
            count,
            blockMS: blockMs
        }
    ) 
    return parseXReadGroupResponse(raw);
}

const flushBufferedEvents = async (buffer: LikeEvent[]) => {
    if (buffer.length === 0) return [];

    const eventsToProcess = [...buffer];
    buffer.length = 0;
    await processBatch(eventsToProcess);
    return buffer;
}

const processBatch = async (events: LikeEvent[]) => {
    if (events.length === 0) return;

    const lastAction = new Map<string, LikeEvent>();
    for (const e of events) {
        lastAction.set(`${e.postId}:${e.userId}`, e);
    }

    const toLike: LikeEvent[] = [];
    const toUnlike: LikeEvent[] = [];

    for (const e of lastAction.values()) {
        if (e.action === "like") toLike.push(e);
        else toUnlike.push(e)
    }

    const postIds = [...new Set(events.map((e)=>e.postId))];
    const likePairs = [...toLike, ...toUnlike].map(e => ({
        post_id: e.postId,
        user_id: e.userId
    }));

    const [posts, existingLikes] = await prisma.$transaction([
        prisma.post.findMany({
            where: { id: { in: postIds } },
            select: { id: true, created_by: true }
        }),
        likePairs.length
            ? prisma.postLike.findMany({
                where: { OR: likePairs },
                select: { post_id: true, user_id: true }
            })
            : prisma.postLike.findMany({
                where: { id: { in: [] } },
                select: { post_id: true, user_id: true }
            })
    ]);

    const authorByPostId = new Map(posts.map(post => [post.id, post.created_by]));
    const existingLikeKeys = new Set(
        existingLikes.map(like => `${like.post_id}:${like.user_id}`)
    );

    const effectiveLikes = toLike.filter(
        e => !existingLikeKeys.has(`${e.postId}:${e.userId}`)
    );
    const effectiveUnlikes = toUnlike.filter(
        e => existingLikeKeys.has(`${e.postId}:${e.userId}`)
    );

    await prisma.$transaction(async (tx) => {
        if (effectiveLikes.length) {
            await tx.postLike.createMany({
                data: effectiveLikes.map(e => ({ post_id: e.postId, user_id: e.userId })),
                skipDuplicates: true
            });
        }

        if (effectiveUnlikes.length) {
            await tx.postLike.deleteMany({
                where: {
                    OR: effectiveUnlikes.map(e => ({ post_id: e.postId, user_id: e.userId }))
                }
            })
        }

        const deltaByPost = new Map<string, number>();
        const deltaByAuthor = new Map<string, number>();

        for (const e of effectiveLikes) {
            deltaByPost.set(e.postId, (deltaByPost.get(e.postId) ?? 0) + 1);

            const authorId = authorByPostId.get(e.postId);
            if (authorId) {
                deltaByAuthor.set(authorId, (deltaByAuthor.get(authorId) ?? 0) + 1);
            }
        }

        for (const e of effectiveUnlikes) {
            deltaByPost.set(e.postId, (deltaByPost.get(e.postId) ?? 0) - 1);

            const authorId = authorByPostId.get(e.postId);
            if (authorId) {
                deltaByAuthor.set(authorId, (deltaByAuthor.get(authorId) ?? 0) - 1);
            }
        }

        for (const [postId, delta] of deltaByPost.entries()) {
            if (delta === 0) continue;
            await tx.post.update({
                where: { id: postId },
                data: { likes_count: { increment: delta } }
            })
        }

        for (const [authorId, delta] of deltaByAuthor.entries()) {
            if (delta === 0) continue;
            await tx.user.update({
                where: { id: authorId },
                data: { total_likes_received: { increment: delta } }
            })
        }
    });

    await redis.xack(
        STREAM_KEY,
        GROUP,
        events.map(e => e.id)
    );

    await redis.xdel(
        STREAM_KEY,
        events.map(e => e.id)
    );
}

// const main = async () => {
//     await ensureGroup();
//     console.log("Likes worker running...");

//     while (true) {
//         const pending = await redis.xreadgroup(GROUP,CONSUMER,STREAM_KEY,"0",{count:MAX_BATCH_SIZE});
//         const pendingEvents = parseXReadGroupResponse(pending)
//         if (pendingEvents.length === 0) break;
//         await processBatch(pendingEvents);
//     }

//     const bufferedEvents: LikeEvent[] = [];
//     let firstBufferedAt = 0;

//     while (true) {
//         if (bufferedEvents.length === 0) {
//             const events = await readBatch(MAX_BATCH_SIZE, POLL_BLOCK_MS);
//             if (events.length === 0) continue;

//             bufferedEvents.push(...events);
//             firstBufferedAt = Date.now();
//             continue;
//         }

//         const elapsed = Date.now() - firstBufferedAt;
//         const remainingWindow = FLUSH_WINDOW_MS - elapsed;

//         if (remainingWindow <= 0 || bufferedEvents.length >= MAX_BATCH_SIZE) {
//             await flushBufferedEvents(bufferedEvents);
//             firstBufferedAt = 0;
//             continue;
//         }

//         const events = await readBatch(
//             Math.max(1, MAX_BATCH_SIZE - bufferedEvents.length),
//             Math.min(POLL_BLOCK_MS, remainingWindow)
//         );

//         if (events.length > 0) {
//             bufferedEvents.push(...events);
//         }

//         if (
//             bufferedEvents.length >= MAX_BATCH_SIZE ||
//             Date.now() - firstBufferedAt >= FLUSH_WINDOW_MS
//         ) {
//             await flushBufferedEvents(bufferedEvents);
//             firstBufferedAt = 0;
//         }
//     }
// }

// main().catch(err => {
//     console.error("Worker Failed:", err);
//     process.exit(1)
// })

const runWorkerLoop = async () => {
    try {
        // recover pending messages
        while (true) {
            const pending = await redis.xreadgroup(
                GROUP,
                CONSUMER,
                STREAM_KEY,
                "0",
                { count: MAX_BATCH_SIZE }
            );

            const pendingEvents = parseXReadGroupResponse(pending);
            if (pendingEvents.length === 0) break;

            await processBatch(pendingEvents);
        }

        const bufferedEvents: LikeEvent[] = [];
        let firstBufferedAt = 0;

        while (true) {
            if (bufferedEvents.length === 0) {
                const events = await readBatch(MAX_BATCH_SIZE, POLL_BLOCK_MS);
                if (events.length === 0) continue;

                bufferedEvents.push(...events);
                firstBufferedAt = Date.now();
                continue;
            }

            const elapsed = Date.now() - firstBufferedAt;
            const remainingWindow = FLUSH_WINDOW_MS - elapsed;

            if (remainingWindow <= 0 || bufferedEvents.length >= MAX_BATCH_SIZE) {
                await flushBufferedEvents(bufferedEvents);
                firstBufferedAt = 0;
                continue;
            }

            const events = await readBatch(
                Math.max(1, MAX_BATCH_SIZE - bufferedEvents.length),
                Math.min(POLL_BLOCK_MS, remainingWindow)
            );

            if (events.length > 0) {
                bufferedEvents.push(...events);
            }

            if (
                bufferedEvents.length >= MAX_BATCH_SIZE ||
                Date.now() - firstBufferedAt >= FLUSH_WINDOW_MS
            ) {
                await flushBufferedEvents(bufferedEvents);
                firstBufferedAt = 0;
            }
        }

    } catch (err) {
        console.error("Worker loop crashed:", err);

        // 🔁 restart after crash (VERY IMPORTANT)
        setTimeout(runWorkerLoop, 5000);
    }
};

export const startLikesWorker = async () => {
    try {
        await ensureGroup();
        console.log("Likes worker running...");

        // 🔥 run in background (don’t block server)
        runWorkerLoop();

    } catch (err) {
        console.error("Worker init failed:", err);
    }
};
