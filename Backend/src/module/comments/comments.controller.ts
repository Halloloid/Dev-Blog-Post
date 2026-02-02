import { Request,Response } from "express";
import { prisma } from "../../config/db";
import { redis } from "../../config/redis";

export const addComment = async(req:Request,res:Response) => {
    try {
        const user = req.user as {sub : string}
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const {postId} = req.params;
        
        if(typeof postId !== "string") return res.status(400).json({message:"Invalid Id"});

        const postExists = await prisma.post.findUnique({
            where:{id:postId},
            select:{id:true}
        })

        if (!postExists) {
          return res.status(404).json({ message: "Post not found" });
        }

        const {content} = req.body;

        if (typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        if (content.length > 500) {
          return res.status(400).json({ message: "Comment too long" });
        }

        const comment = await prisma.comment.create({
            data:{
                content:content,
                post_id:postId,
                user_id:user.sub
            },
            include:{
                author:{
                    select:{
                        id:true,
                        full_name:true,
                        user_name:true,
                        avatar_url:true
                    }
                }
            }
        })

        //redis cache invalidation
        try {
            await redis.del(`post:${postId}`)
            console.log("Redis Cache Deleted")
        } catch (error:any) {
            console.error("Redis Cache Delete Error",error)
        }
        res.status(201).json(comment)
    } catch (error:any) {
        console.error(error);
        res.status(500).json({message:"Server Error"})
    }
}

export const updateComment = async(req:Request,res:Response) => {
    try {
        const user = req.user as {sub : string}
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const {commentId} = req.params;
        if(typeof commentId !== "string") return res.status(400).json({message:"Invalid Id"});

        const {content} = req.body;

        if (typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        if (content.length > 500) {
          return res.status(400).json({ message: "Comment too long" });
        }

        const existingComment = await prisma.comment.findFirst({
            where:{
                id:commentId,
                user_id:user.sub
            },
            select:{
                id:true,
                post_id:true
            }
        })

        if(!existingComment) return res.status(403).json({message:"Unauthorized Comment Not Found"});

        await prisma.comment.update({
            where:{id:existingComment.id},
            data:{content}
        })
        //redis cache invalidation
        try {
            await redis.del(`post:${existingComment.post_id}`)
            console.log("Redis Cache Deleted")
        } catch (error:any) {
            console.error("Redis Cache Delete Error",error)
        }

        res.status(200).json({ message: "Comment updated" });
    } catch (error:any) {
        console.error(error)
        res.status(500).json({message:"Server Side Error"})
    }
}