import { Request,Response } from "express";
import axios from "axios";
import { prisma } from "../../config/db";

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

        res.status(201).json(comment)
    } catch (error:any) {
        console.error(error);
        res.status(500).json({message:"Server Error"})
    }
}