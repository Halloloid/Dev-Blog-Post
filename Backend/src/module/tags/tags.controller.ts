import { Request,Response } from "express"
import { prisma } from "../../config/db.js"
import { redis } from "../../config/redis.js"


export const allTags = async(req:Request,res:Response) => {
    try {

        const cached = await redis.get("tags:all")
        if(cached) return res.status(200).json(cached);

        const tags = await prisma.tag.findMany({
            select:{
                id:true,
                slug:true,
                name:true
            },
            orderBy:{
                name:"asc"
            }
        })

        await redis.set("tags:all",tags,{ex:300})
        res.status(200).json(tags)
    } catch (error:any) {
        console.log("Error in Tags API:",error)
        res.status(500).json({message:"Server Side Error"})
    }
}