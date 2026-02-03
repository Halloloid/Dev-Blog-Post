import express from "express"
import { publicUserProfile } from "./user.repository.js"

const userRoutes = express.Router()

userRoutes.get("/:username",publicUserProfile)

export default userRoutes