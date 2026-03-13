import express from "express"
import { createUsername, publicUserProfile } from "./user.repository.js"
import { authMiddleware } from "../../middlewares/auth.middleware.js"

const userRoutes = express.Router()

userRoutes.get("/:username",publicUserProfile)
userRoutes.post("/create",authMiddleware,createUsername)

export default userRoutes