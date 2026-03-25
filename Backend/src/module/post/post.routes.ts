import express from "express"
import { createPost, deletePost, posts, publishPost, specificPost, updatePost } from "./post.controller.js"
import { authMiddleware } from "../../middlewares/auth.middleware.js"
import { upload } from "../../middlewares/upload.middleware.js"


const postRoutes = express.Router()

postRoutes.get("/",posts)
postRoutes.get("/:id",specificPost)

postRoutes.post("/",authMiddleware,upload.single("featured_img"),createPost)

postRoutes.put("/:id",authMiddleware,updatePost)

postRoutes.patch("/:id/publish",authMiddleware,publishPost)

postRoutes.delete("/:id",authMiddleware,deletePost)
export default postRoutes