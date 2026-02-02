import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware"
import { addComment, updateComment } from "./comments.controller"

const commentRoutes = express.Router()

commentRoutes.post("/:postId/post",authMiddleware,addComment)

commentRoutes.patch("/:commentId",authMiddleware,updateComment)

export default commentRoutes