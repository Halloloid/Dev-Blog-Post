import { Request,Response } from "express"
import {prisma} from "../../config/db.js"

export const replies = async(req:Request,res:Response) => {
    try {
        const {commentId} = req.params
        if(typeof commentId !== "string"){
            return res.status(400).json({message:"Invalid ID"})
        }

        const parentComment = await prisma.comment.findUnique({
            where:{id:commentId},
            select:{
                id:true
            }
        })

        if(!parentComment){
            return res.status(404).json({message:"Comment Not Found"})
        }

        const replies = await prisma.comment.findMany({
            where:{
                parent_comment_id:commentId
            },
            orderBy:{
                created_at:"desc"
            },
            select:{
                id:true,
                content:true,
                created_at:true,
                author:{
                    select:{
                        id:true,
                        user_name:true,
                        avatar_url:true
                    }
                }
            }
        })
        return res.status(200).json({
                parentCommentId:commentId,
                count:replies.length,
                data:replies
        })
    } catch (error:any) {
        console.error(error);
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const addReply = async(req:Request,res:Response) => {
    try {

        const user = req.user as {sub : string}
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const {commentId} = req.params
        if(typeof commentId !== "string"){
            return res.status(400).json({message:"Invalid ID"})
        }

        const parentComment = await prisma.comment.findUnique({
            where:{id:commentId},
            select:{
                id:true,
                post_id:true
            }
        })

        if(!parentComment){
            return res.status(404).json({message:"Comment Not Found"})
        }

        const {content} = req.body;

        if (typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        if (content.length > 500) {
          return res.status(400).json({ message: "Comment too long" });
        }

        const reply = await prisma.comment.create({
            data:{
                parent_comment_id:commentId,
                content:content,
                post_id:parentComment.post_id,
                user_id:user.sub
            },
            include:{
                author:{
                    select:{
                        id:true,
                        avatar_url:true,
                        full_name:true,
                        user_name:true
                    }
                }
            }
        })

        res.status(201).json(reply)
    } catch (error:any) {
        console.error(error);
        res.status(500).json({message:"Server Error"})
    }
}

export const updateReply = async(req:Request,res:Response) => {
    try {
        const user = req.user as {sub : string}
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const {replyId} = req.params
        if(typeof replyId !== "string"){
            return res.status(400).json({message:"Invalid ID"})
        }

        const existingReply = await prisma.comment.findFirst({
            where:{
                id:replyId,
                user_id:user.sub,
                parent_comment_id:{not:null}
            },
            select:{
                id:true,
            }
        })

        if(!existingReply) return res.status(403).json({message:"Unauthorized Comment Not Found"});

        const {content} = req.body;

        if (typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        if (content.length > 500) {
          return res.status(400).json({ message: "Comment too long" });
        }

        await prisma.comment.update({
            where:{id:existingReply.id},
            data:{content}
        })


        res.status(200).json({ message: "Reply updated" });
    } catch (error:any) {
        console.error("Update Reply Error",error)
        res.status(500).json({message:"Server Side Error"})
    }
}

export const deleteReply = async(req:Request,res:Response) => {
    try {
        const user = req.user as {sub : string}
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const {replyId} = req.params
        if(typeof replyId !== "string"){
            return res.status(400).json({message:"Invalid ID"})
        }

        const existingReply = await prisma.comment.findFirst({
            where:{
                id:replyId,
                user_id:user.sub,
                parent_comment_id:{not:null}
            },
            select:{
                id:true,
            }
        })

        if(!existingReply) return res.status(403).json({message:"Unauthorized Comment Not Found"});

        await prisma.comment.delete({
            where:{id:existingReply.id}
        })

        res.status(204).send();
    } catch (error:any) {
        console.error("Delete Reply Error:",error)
        res.status(500).json({message:"Server Side Error"})
    }
}