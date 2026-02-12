import jwt from "jsonwebtoken"
import { Request,Response,NextFunction } from "express"
import { config } from "dotenv";
import { JwtPayload } from "jsonwebtoken";

export interface AuthPayload extends JwtPayload {
    sub:string;
    email:string;
}

config();

export const authMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const token = req.cookies?.access_token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    } 

    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET){
            throw new Error("JWT Secret is not Defined")
        }
        const decoded = jwt.verify(token,JWT_SECRET);

        if(typeof decoded !== "object" || !("sub" in decoded) || !("email" in decoded)){
            return res.status(401).json({message:"Invalid token Payload"})
        }
        req.user = decoded as AuthPayload
        next();
    } catch (error:any) {
        console.error("Middleware Error",error)
        return res.status(401).json({ message: "Invalid token" });
    }
}