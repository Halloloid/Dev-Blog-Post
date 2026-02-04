import fs from "fs"
import path from "path"
import { redis } from "../../config/redis.js"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

const VIEW_LUA = fs.readFileSync(
    path.join(__dirname,"view.lua"),"utf-8"
)

export const trackPostView = async(postId:string,viewerId:string) => {
    try {
        await redis.eval(VIEW_LUA,
            [
                `views:post:${postId}`,
                `views:post:${postId}:seen`,
                "view:dirty"
            ],
            [
                viewerId,
                postId,
                "1800"
            ]
        )
    } catch (error:any) {
        console.error("View Tracking Failed:-",error)
    }
}