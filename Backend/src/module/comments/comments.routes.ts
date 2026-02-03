import express from "express"
import { authMiddleware } from "../../middlewares/auth.middleware.js"
import { addComment, deleteComment, updateComment } from "./comments.controller.js"

const commentRoutes = express.Router()

commentRoutes.post("/:postId/post",authMiddleware,addComment)

commentRoutes.patch("/:commentId",authMiddleware,updateComment)

commentRoutes.delete("/:commentId",authMiddleware,deleteComment)

export default commentRoutes