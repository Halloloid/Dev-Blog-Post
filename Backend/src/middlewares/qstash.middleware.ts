import { Receiver } from "@upstash/qstash";
import type { Request,Response,NextFunction } from "express";
import { config } from "dotenv";

config();

const receiver = new Receiver({
    currentSigningKey:process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey:process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export const qstashMiddleware = async(req:Request,res:Response,next:NextFunction) => {
    try {
        const signature = req.headers["upstash-signature"] as string | undefined;

        if(!signature){
            return res.status(401).json({message:"Missing Qstash signature"})
        }

        const isValid = await receiver.verify({
            signature,
            body:(req as any).rawBody
        })

        if (!isValid) {
            return res.status(401).json({ message: "Invalid QStash signature" });
        }

       next();
    } catch (error:any) {
       return res.status(401).json({ message: "QStash verification failed" }); 
    }
}