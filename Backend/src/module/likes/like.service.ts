import { redis } from "../../config/redis.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { prisma } from "../../config/db.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

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

export async function hydrateLikesIfNeeded(postId: string) {
  const exists = await redis.exists(`likes:count:${postId}`);

  if (exists) return;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { likes_count: true }
  });

  const count = post?.likes_count ?? 0;

  await redis.set(`likes:count:${postId}`, count);
}


export const toggleLike = async(postId:String,userId:String,action:"like" | "unlike") => {
    const lua = action === "like" ? LIKE_LUA : UNLIKE_LUA;

    const result = await redis.eval(
        lua,
        [
            `likes:post:${postId}`,
            `likes:count:${postId}`,
            "likes:events"
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