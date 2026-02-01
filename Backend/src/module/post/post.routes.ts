import express from "express"
import { createPost, posts, specificPost } from "./post.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { upload } from "../middlewares/upload.middleware"


const postRoutes = express.Router()

postRoutes.get("/",posts)
postRoutes.get("/:id",specificPost)

postRoutes.post("/",authMiddleware,upload.single("featured_img"),createPost)

export default postRoutes