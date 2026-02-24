import { Request,Response } from "express";
import { prisma } from "../../config/db.js";

export const followtoggle = async(req:Request,res:Response) => {
    try {
        const user = req.user as {sub : string}
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const {followId } = req.params
        if(typeof followId !== "string") return res.status(400).json({message:"Invalid id"});

        //self-follow protection
        if (user.sub === followId) {
            return res.status(400).json({ message: "You cannot follow yourself" })
        }
        const followidexists = await prisma.user.findUnique({where:{id:followId},select:{id:true}});

        if(!followidexists) return res.status(400).json({message:"No such user exists"});

        const alreadyFollowing = await prisma.follower.findUnique({
            where:{
                follower_id_following_id:{
                    follower_id:user.sub,
                    following_id:followId
                }
            }
        })

        const result = await prisma.$transaction(async(tx)=>{
            if(alreadyFollowing){
                //Unfollow
                await tx.follower.delete({
                    where:{id:alreadyFollowing.id}
                })

                await tx.user.update({
                    where:{id:user.sub},
                    data:{total_following:{decrement:1}}
                })

                await tx.user.update({
                    where:{id:followId},
                    data:{total_followers:{decrement:1}}
                })

                return {followed:false}
            }

            //Follow
            await tx.follower.create({
                data:{
                    follower_id:user.sub,
                    following_id:followId
                }
            })

            await tx.user.update({
                where:{id:user.sub},
                data:{total_following:{increment:1}}
            })

            await tx.user.update({
                where:{id:followId},
                data:{total_followers:{increment:1}}
            })

            return {followed:true}
        })

        return res.status(200).json(result)
    } catch (error:any) {
        console.error("Follow Unfollow error:-",error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getMyFollowers = async(req:Request,res:Response) => {
    try {
        const user = req.user as { sub:string }
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const followers = await prisma.follower.findMany({
            where:{following_id:user.sub},
            include:{
                follower:{
                    select:{
                        id:true,
                        full_name:true,
                        user_name:true,
                        avatar_url:true
                    }
                }
            },
            orderBy:{
                created_at:"desc"
            }
        })

        return res.status(200).json({
            count:followers.length,
            followers:followers.map(f=>f.follower)
        })
    } catch (error:any) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getMyFollowing = async(req:Request,res:Response) => {
    try {
         const user = req.user as { sub:string }
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const following = await prisma.follower.findMany({
            where:{follower_id:user.sub},
            include:{
                following:{
                    select:{
                        id:true,
                        full_name:true,
                        user_name:true,
                        avatar_url:true,
                    }
                }
            },
            orderBy:{
                created_at:"desc"
            }
        })

        return res.status(200).json({
            count: following.length,
            following: following.map(f => f.following)
        })
    } catch (error:any) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getFollowing = async(req:Request,res:Response) => {
    try {
        const {user_name} = req.params;

        if(typeof user_name !== "string") return res.status(400).json({message:"Invalid Data"});

        const userExists = await prisma.user.findUnique({where:{user_name:user_name},select:{id:true}})

        if(!userExists) return res.status(404).json({message:"No Such User"})
        
        const following = await prisma.follower.findMany({
            where:{follower_id:userExists.id},
            include:{
                following:{
                    select:{
                        user_name:true,
                        avatar_url:true,
                        full_name:true,
                    }
                }
            },
            orderBy:{
                created_at:"desc"
            }
        })

        return res.status(200).json({
            count: following.length,
            following: following.map(f => f.following)
        })
    } catch (error) {
        console.error("Followe Api error:",error)
        return res.status(500).json({message:"Internal Server Error"})
    }
}

export const getFollowers = async(req:Request,res:Response) => {
    try {
        const {user_name} = req.params;

        if(typeof user_name !== "string") return res.status(400).json({message:"Invalid Data"});

        const userExists = await prisma.user.findUnique({where:{user_name:user_name},select:{id:true}})

        if(!userExists) return res.status(404).json({message:"No Such User"})
        
        const follower = await prisma.follower.findMany({
            where:{following_id:userExists.id},
            include:{
                follower:{
                    select:{
                        user_name:true,
                        avatar_url:true,
                        full_name:true,
                    }
                }
            },
            orderBy:{
                created_at:"desc"
            }
        })

        return res.status(200).json({
            count: follower.length,
            follower: follower.map(f => f.follower)
        })
    } catch (error) {
        console.error("Followe Api error:",error)
        return res.status(500).json({message:"Internal Server Error"})
    }
}