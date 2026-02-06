import express from "express"
import { authMiddleware } from "../../middlewares/auth.middleware.js"
import { followtoggle, getMyFollowers, getMyFollowing } from "./followers.controller.js"

const followerRoute = express.Router()

followerRoute.post("/:followId",authMiddleware,followtoggle)

followerRoute.get("/followers",authMiddleware,getMyFollowers)
followerRoute.get("/following",authMiddleware,getMyFollowing)

export default followerRoute