import { Request,Response } from "express";
import { getLikeCount, isLiked, toggleLike } from "./like.service";


export const likeController = async(req:Request,res:Response) => {
    try {
        const {postId,action} = req.body
        const user = req.user as {sub : string}
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        if(!postId || !["like","unlike"].includes(action)) return res.status(400).json({message:"Invalid Request"});

        const success = await toggleLike(postId,user.sub,action);

        res.status(200).json(success)
    } catch (error:any) {
        console.error("Like Controller Error:-",error);
        res.status(500).json({message:"Server Error"})
    }
}


export const likeCountController = async(req:Request,res:Response) => {
    try {
        const {postId} = req.params
        if(typeof postId !== "string") return res.status(400).json({message:"Invalid ID"});

        const count = await getLikeCount(postId);

        res.status(200).json({count:count});
    } catch (error:any) {
        console.error("Like Count Controller Error:-",error);
        res.status(500).json({message:"Server Error"})
    }
}

export const isLikedController = async(req:Request,res:Response) => {
    try {
        const user = req.user as {sub : string}
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const {postId} = req.params
        if(typeof postId !== "string") return res.status(400).json({message:"Invalid ID"});

        const liked = await isLiked(postId,user.sub);
        res.status(200).json({isLikedby:liked});
    } catch (error:any) {
        console.error("Like Checker Controller Error:-",error);
        res.status(500).json({message:"Server Error"})
    }
}