import { Request,Response } from "express"
import {prisma} from "../../config/db"

export const replies = async(req:Request,res:Response) => {
    try {
        const {id} = req.params
        if(typeof id !== "string"){
            return res.status(400).json({message:"Invalid ID"})
        }

        const parentComment = await prisma.comment.findUnique({
            where:{id},
            select:{
                id:true
            }
        })

        if(!parentComment){
            return res.status(404).json({message:"Comment Not Found"})
        }

        const replies = await prisma.comment.findMany({
            where:{
                parent_comment_id:id
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
                parentCommentId:id,
                count:replies.length,
                data:replies
        })
    } catch (error:any) {
        console.error(error);
        return res.status(500).json({message:"Internal Server Error"})
    }
}