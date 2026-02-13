import express,{Request,Response} from "express"
import { config } from "dotenv";
import { connectDB,disconnectDB } from "./config/db.js";
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./module/users/users.routes.js";
import postRoutes from "./module/post/post.routes.js";
import authRoutes from "./module/authentication/auth.routes.js";
import replyRoutes from "./module/replies/replies.routes.js";
import commentRoutes from "./module/comments/comments.routes.js";
import likeRoutes from "./module/likes/likes.routes.js";
import { qstashMiddleware } from "./middlewares/qstash.middleware.js";
import { syncLikesJob } from "./jobs/syncLikes.js";
import { syncViewsToDB } from "./jobs/syncViews.js";
import followerRoute from "./module/followers/followers.routes.js";
import { combinedRateLimiter } from "./middlewares/rateLimiter.middleware.js";

config();
connectDB();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5174",
    credentials:true
}))

app.use(express.json({
    verify:(req:any,_res,buf)=>{
        req.rawBody = buf.toString();
    }
}))
app.use(express.urlencoded({extended:true}))

//Rate Limiting the APIs
app.use("/api",combinedRateLimiter)
app.use("/api/hello",async(req:Request,res:Response)=>{
    res.status(200).json({message:"APIs are working"})
})
//api endpoints
app.use("/auth",authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/posts",postRoutes)
app.use("/api/replies",replyRoutes)
app.use("/api/comments",commentRoutes)
app.use("/api/likes",likeRoutes)
app.use("/api/follow",followerRoute)
app.post("/internal/sync-views", qstashMiddleware, async (req, res) => {
    try {
        await syncViewsToDB();
        res.status(200).json({ message: "Views synced successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to sync views" });
    }
});
app.post("/internal/sync-likes",qstashMiddleware,syncLikesJob)

app.use((_:Request,res:Response)=>{
    res.status(404).json({"Message":"No Such Routes"})
})

const server = app.listen(PORT,()=>{
    console.log(`Server is Running on PORT:${PORT}`)
})

//Handle unhandled promise rejection
process.on("unhandledRejection",(err)=>{
    console.error("Unhadled Rejction",err);
    server.close(async () =>{
        await disconnectDB();
        process.exit(1);
    });
});

// handle uncaught exception
process.on("uncaughtException",async(err)=>{
    console.error("unCaught Exception",err);
     await disconnectDB();
     process.exit(1);
})

//Graceful Shutdown
process.on("SIGTERM",async()=>{
    console.log("SIGTERM recevied ,shutting down gracefully");
    server.close(async () =>{
        await disconnectDB();
        process.exit(0);
    });
})

//started at 25-01-26