import jwt from "jsonwebtoken"
import { Request,Response,NextFunction } from "express"
import { config } from "dotenv";

config();

export const authMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const token = req.cookies?.access_token || req.headers.authorization?.split(" ")[1];;
    

    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    } 

    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET){
            throw new Error("JWT Secret is not Defined")
        }
        const payload = jwt.verify(token,JWT_SECRET);
        req.user = payload;
        next();
    } catch (error:any) {
        console.error(error)
        return res.status(401).json({ message: "Invalid token" });
    }
}