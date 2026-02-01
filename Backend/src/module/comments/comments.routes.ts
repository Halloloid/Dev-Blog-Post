import express from "express"
import { replies } from "./comments.controller"

const commentRoutes = express.Router()

commentRoutes.get("/:id/replies",replies)

export default commentRoutes

