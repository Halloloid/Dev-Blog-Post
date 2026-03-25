import express from "express"
import { addReply, deleteReply, replies, updateReply } from "./replies.controller.js"
import { authMiddleware } from "../../middlewares/auth.middleware.js"

const replyRoutes = express.Router()

replyRoutes.get("/:commentId",replies)

replyRoutes.post("/:commentId",authMiddleware,addReply)

replyRoutes.patch("/:replyId",authMiddleware,updateReply)

replyRoutes.delete("/:replyId",authMiddleware,deleteReply)

export default replyRoutes

