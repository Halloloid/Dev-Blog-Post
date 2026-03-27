import { Request,Response } from "express";
import { prisma } from "../../config/db.js";
import jwt from "jsonwebtoken";

const getOptionalUserId = (req: Request) => {
    const token = req.cookies?.access_token || req.headers.authorization?.split(" ")[1];
    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) return null;

        const decoded = jwt.verify(token, secret);
        if (typeof decoded === "object" && decoded && "sub" in decoded) {
            return String(decoded.sub);
        }
    } catch {
        return null;
    }

    return null;
};

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
            }
        })

        if(!user) return res.status(404).json({message:"No such User"});

        const requesterId = getOptionalUserId(req);
        const isOwner = requesterId === user.id;

        const posts = await prisma.post.findMany({
            where:{
                created_by:user.id,
                status:isOwner ? {
                    in:["published","draft"]
                } : "published"
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
                likes_count:true,
                featured_img:true,
                exceprt:true,
                status:true
            }
        });

        res.status(200).json({
            ...user,
            posts
        });
    } catch (error:any) {
        res.status(500).json({message:"Server Error"})
    }
}

export const createUsername = async(req:Request,res:Response) => {
    try {
        const user = req.user as {sub:string}
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const username = req.body.username?.trim().toLowerCase();

        if(!username || !/^[a-z0-9._]{3,20}$/.test(username)){
            return res.status(400).json({message:"Invalid Username"})
        }

        await prisma.user.update({
            where:{id:user.sub},
            data:{
                user_name:username
            }
        })
        return res.status(200).json({message:`User name is :${username}`})
        

    } catch (error:any) {
        if(error.code === "P2002") return res.status(400).json({message:"Username already taken"});
        console.error(error);
        res.status(500).json({message:"Server Error"})
    }
}
