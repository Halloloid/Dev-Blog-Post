import express from "express"
import { authMiddleware } from "../../middlewares/auth.middleware.js"
import { followtoggle, getFollowers, getFollowing, getMyFollowers, getMyFollowing } from "./followers.controller.js"

const followerRoute = express.Router()

followerRoute.post("/:followId", authMiddleware, followtoggle)

followerRoute.get("/followers", authMiddleware, getMyFollowers)
followerRoute.get("/following", authMiddleware, getMyFollowing)

followerRoute.get("/followings/:user_name", getFollowing)
followerRoute.get("/followers/:user_name", getFollowers)

export default followerRoute