import express from "express"
import { replies } from "./replies.controller"

const replyRoutes = express.Router()

replyRoutes.get("/:id/replies",replies)

export default replyRoutes

