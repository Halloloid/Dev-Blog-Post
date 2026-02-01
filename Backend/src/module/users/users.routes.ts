import express from "express"
import { publicUserProfile } from "./user.repository"

const userRoutes = express.Router()

userRoutes.get("/:username",publicUserProfile)

export default userRoutes