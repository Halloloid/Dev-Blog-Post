import express from "express"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { isLikedController, likeController } from "./likes.controller"

const likeRoutes = express.Router()

likeRoutes.post("/",authMiddleware,likeController)

likeRoutes.get("/posts/:postId/count",likeController)
likeRoutes.get("/posts/:postId/check",authMiddleware,isLikedController)

export default likeRoutes