import express from "express"
import { logout,googleAuth,googleCallback } from "./auth.controller"

const authRoutes = express.Router()

authRoutes.get("/google",googleAuth)
authRoutes.get("/google/callback",googleCallback)
authRoutes.post("/logout",logout)

export default authRoutes