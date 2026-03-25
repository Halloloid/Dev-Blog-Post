import { redis } from "../config/redis.js";
import { prisma } from "../config/db.js";

const STREAM_KEY = "likes:events";
const GROUP = "likes-group";
const CONSUMER = "likes-worker-1";

type XReadGroupEntry = [string, Record<string, string>];
type XReadGroupResponse = [string, XReadGroupEntry[]][];

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


const readBatch = async (count = 200, blockMs = 5000): Promise<LikeEvent[]> => {
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

    if (toLike.length) {
        await prisma.postLike.createMany({
            data: toLike.map(e => ({ post_id: e.postId, user_id: e.userId })),
            skipDuplicates: true
        });
    }

    if (toUnlike.length) {
        await prisma.postLike.deleteMany({
            where: {
                OR: toUnlike.map(e => ({ post_id: e.postId, user_id: e.userId }))
            }
        })
    }

    const deltaByPost = new Map<string, number>();
    for (const e of toLike) {
        deltaByPost.set(e.postId, (deltaByPost.get(e.postId) ?? 0) + 1);
    }

    for (const e of toUnlike) {
        deltaByPost.set(e.postId, (deltaByPost.get(e.postId) ?? 0) - 1);
    }

    for (const [postId, delta] of deltaByPost.entries()) {
        if (delta === 0) continue;
        await prisma.post.update({
            where: { id: postId },
            data: { likes_count: { increment: delta } }
        })
    }

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

const main = async () => {
    await ensureGroup();
    console.log("Likes worker running...");

    while (true) {
        const pending = await redis.xreadgroup(GROUP,CONSUMER,STREAM_KEY,"0",{count:200});
        const pendingEvents = parseXReadGroupResponse(pending)
        await processBatch(pendingEvents);

        const events = await readBatch();
        await processBatch(events)
    }
}

main().catch(err => {
    console.error("Worker Failed:", err);
    process.exit(1)
})
