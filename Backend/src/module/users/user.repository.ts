import { Request,Response } from "express";
import { prisma } from "../../config/db";

export const publicUserProfile = async(req:Request,res:Response) => {
    try {
        const { username } = req.params;

        if(!username || typeof username !== "string") return res.status(400).json({message:"Invalid Username"});

        const user = await prisma.user.findUnique({
            where:{user_name:username},
            select:{
                id:true,
                full_name:true,
                user_name:true,
                avatar_url:true,
                bio:true,
                
                total_followers:true,
                total_following:true,
                total_likes_received:true,
                total_posts:true,
                
                created_at:true,

                posts:{
                    where:{
                        status:"published"
                    },
                    orderBy:{
                        created_at:"desc"
                    },
                    select:{
                        id:true,
                        title:true,
                        created_at:true,
                        view_count:true,
                        comments_count:true,
                        exceprt:true
                    }
                }
            }
        })

        if(!user) return res.status(404).json({message:"No such User"});

        res.status(200).json(user);
    } catch (error:any) {
        res.status(500).json({message:"Server Error"})
    }
}