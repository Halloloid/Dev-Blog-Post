import express,{Request,Response} from "express"
import { config } from "dotenv";
import { connectDB,disconnectDB } from "./config/db";
import userRoutes from "./module/users/users.routes";
import postRoutes from "./module/post/post.routes";
import cookieParser from "cookie-parser"
import cors from "cors"
import authRoutes from "./module/authentication/auth.routes";
import commentRoutes from "./module/comments/comments.routes";

config();
connectDB();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5174",
    credentials:true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/auth",authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/posts",postRoutes)
app.use("/api/comments",commentRoutes)
app.use((req:Request,res:Response)=>{
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