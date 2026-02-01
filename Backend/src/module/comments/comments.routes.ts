import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware"
import { addComment } from "./comments.controller"

const commentRoutes = express.Router()

commentRoutes.post("/:postId",authMiddleware,addComment)

export default commentRoutes