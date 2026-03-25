import express from "express"
import { logout,googleAuth,googleCallback, getMe } from "./auth.controller.js"
import { softAuthLimiter } from "../../middlewares/rateLimiter.middleware.js"

const authRoutes = express.Router()

authRoutes.get("/google",softAuthLimiter,googleAuth)
authRoutes.get("/google/callback",googleCallback)
authRoutes.post("/logout",logout)
authRoutes.get("/me",getMe)

export default authRoutes