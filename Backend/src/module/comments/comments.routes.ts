import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware"
import { addComment, deleteComment, updateComment } from "./comments.controller"

const commentRoutes = express.Router()

commentRoutes.post("/:postId/post",authMiddleware,addComment)

commentRoutes.patch("/:commentId",authMiddleware,updateComment)

commentRoutes.delete("/:commentId",authMiddleware,deleteComment)

export default commentRoutes