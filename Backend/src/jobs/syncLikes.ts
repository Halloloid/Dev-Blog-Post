import { Request,Response } from "express";
import { redis } from "../config/redis.js";
import { prisma } from "../config/db.js";

export const syncLikesJob = async(req:Request,res:Response) => {
    const dirtyPosts = await redis.smembers("likes:dirty");

    for (const postId of dirtyPosts){
        const delta = await redis.getdel<number>(`likes:delta:${postId}`);

        if(!delta || delta === 0){
            await redis.srem("likes:dirty",postId);
            continue;
        }

        await prisma.post.update({
            where:{id:postId},
            data:{
                likes_count:{increment:delta}
            }
        })

        await redis.set(`likes:delta:${postId}`, 0); 
        await redis.srem("likes:dirty",postId)
    }
    return res.json({success:true})
}