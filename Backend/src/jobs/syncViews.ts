import { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { redis } from "../config/redis.js"

export const syncViewsToDB = async() => {
    const dirtyPosts = await redis.smembers("views:dirty");

    for(const postId of dirtyPosts){
        const views = Number(await redis.get(`views:post:${postId}`)) || 0;

        if(views>0){
            await prisma.post.update({
                where:{id:postId},
                data:{
                    view_count:{increment:views}
                }
            })
        }

        await redis.del(`views:post:${postId}`)
        await redis.srem("views:dirty",postId)
    }
}

