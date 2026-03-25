import express from "express"
import { authMiddleware } from "../../middlewares/auth.middleware.js"
import { isLikedController, likeController, likeCountController } from "./likes.controller.js"

const likeRoutes = express.Router()

likeRoutes.post("/",authMiddleware,likeController)

likeRoutes.get("/posts/:postId/count",likeCountController)
likeRoutes.get("/posts/:postId/check",authMiddleware,isLikedController)

export default likeRoutes