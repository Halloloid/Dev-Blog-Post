import { redis } from "../../config/redis"
import fs from "fs"
import path from "path"

const LIKE_LUA = fs.readFileSync(
    path.join(__dirname,"like.lua"),"utf8"
)

const UNLIKE_LUA = fs.readFileSync(
    path.join(__dirname,"unlike.lua"),"utf8"
)

// export const likePost = async(postId:String,userId:String) => {
//     const result = await redis.eval(
//         LIKE_LUA,
//         [
//             `likes:post:${postId}`,
//             `likes:count:${postId}`,
//             `likes:delta:${postId}`,
//             "likes:dirty"
//         ],
//         [userId,postId]
//     )

//     if(result === 0){
//         return{success:false,message:"Already Liked"};
//     }

//     return {success:true};
// }

// export const unlikePost = async(postId:String,userId:String) => {
//     const result = await redis.eval(
//         UNLIKE_LUA,
//         [
//             `likes:post:${postId}`,
//             `likes:count:${postId}`,
//             `likes:delta:${postId}`,
//             "likes:dirty"
//         ],
//         [userId,postId]
//     )

//     if(result === 0){
//         return{success:false,message:"Not Liked"};
//     }

//     return {success:true};
// }

// Turned the Above two Function in to a Single One

export const toggleLike = async(postId:String,userId:String,action:"like" | "unlike") => {
    const lua = action === "like" ? LIKE_LUA : UNLIKE_LUA;

    const result = await redis.eval(
        lua,
        [
            `likes:post:${postId}`,
            `likes:count:${postId}`,
            `likes:delta:${postId}`,
            "likes:dirty"
        ],
        [userId,postId]
    )

    return result === 1;
}

export const getLikeCount = async(postId:String) => {
    const count = await redis.get<number>(`likes:count:${postId}`);
    return count ?? 0
}

export const isLiked = async(postId:String,userId:String) => {
    return redis.sismember(`likes:post:${postId}`,userId);
}