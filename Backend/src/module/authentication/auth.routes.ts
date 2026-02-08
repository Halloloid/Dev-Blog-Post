import express from "express"
import { logout,googleAuth,googleCallback } from "./auth.controller.js"
import { softAuthLimiter } from "../../middlewares/rateLimiter.middleware.js"

const authRoutes = express.Router()

authRoutes.get("/google",softAuthLimiter,googleAuth)
authRoutes.get("/google/callback",googleCallback)
authRoutes.post("/logout",logout)

export default authRoutes