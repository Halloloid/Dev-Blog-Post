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
        
    } catch (error:any) {
        
    }
}

export const getMyFollowing = async(req:Request,res:Response) => {
    try {
        
    } catch (error:any) {
        
    }
}