import { redis } from "../config/redis.js";
import { prisma } from "../config/db.js";

const STREAM_KEY = "likes:events";
const GROUP = "likes-group";
const CONSUMER = "likes-worker-1";

type XReadGroupEntry = [string,Record<string,string>];
type XReadGroupResponse = [string,XReadGroupEntry[]][];

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

const readBatch = async (count = 200, blockMs = 5000): Promise<LikeEvent[]> => {
    const res = await redis.xreadgroup(
        GROUP,
        CONSUMER,
        STREAM_KEY,
        ">",
        {
            count,
            blockMS: blockMs
        }
    ) as XReadGroupResponse;

    if (!res || res.length === 0) return [];

    //Upstash returns: [[streamKey,[[id,{field:value}]]]]

    const [, entries] = res[0];
    return entries.map(([id, data]: [string, Record<string, string>]) => ({
        id,
        postId: data.postId,
        userId: data.userId,
        action: data.action as "like" | "unlike",
    }));
}

const processBatch = async(events:LikeEvent[]) => {
    
}