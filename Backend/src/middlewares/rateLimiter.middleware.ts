import { Request,Response,NextFunction } from "express";
import { redis } from "../config/redis.js";
import crypto from "crypto"
import { config } from "dotenv";

const RATE_LIMIT_CONFIG = {
    default : {window:60,limit:30},
    auth:{window:60,limit:5},
    posts:{window:60,limit:10},
    comments:{window:60,limit:20},
    likes:{window:60,limit:100}
}

function generateDeviceFingerprint(req:Request): string {
    const userAgent = req.headers["user-agent"] || "";
    const acceptLanguage = req.headers["accept-language"] || "";
    const acceptEncoding = req.headers["accept-encoding"] || "";

    const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    const hash = crypto.createHash("sha256").update(fingerprint).digest("hex");
    return hash.substring(0,16);
}

function getClientIndentifiers(req:Request,res:Response){
    const userId = req.user?.sub || null;

    let deviceId = req.cookies.deviceId;
    if(!deviceId){
        deviceId = crypto.randomBytes(8).toString("hex");
        res.cookie("deviceId",deviceId,{
            httpOnly:true,
            secure:true,
            sameSite:"strict",
            maxAge:30*24*60*60*1000
        })
    }

    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || "unknown";

    const deviceFingerprint = generateDeviceFingerprint(req);

    return {userId,deviceId,ipAddress,deviceFingerprint};
}

function getConfig(req:Request):{window:number,limit:number}{
    const path = req.path.toLowerCase();

    if(path.includes("/auth")) return RATE_LIMIT_CONFIG.auth;
    if(path.includes("/posts") && req.method === "POST") return RATE_LIMIT_CONFIG.posts;
    if(path.includes("/comments") || path.includes("/replies")) return RATE_LIMIT_CONFIG.comments;
    if(path.includes("/likes")) return RATE_LIMIT_CONFIG.likes;

    return RATE_LIMIT_CONFIG.default
}

async function applyRateLimit(key:string,config:{window:number,limit:number},res:Response) :Promise<boolean> {
    const current = await redis.incr(key);

    if(current === 1){
        await redis.expire(key,config.window);
    }

    const ttl = await redis.ttl(key);
    res.setHeader("X-RateLimit-Limit",config.limit);
    res.setHeader("X-RateLimit-Remaining",Math.max(0,config.limit - current));
    res.setHeader("X-RateLimit-Reset",Math.floor(Date.now()/1000)+ttl);

    if(current > config.limit){
        res.setHeader("Retry-After",ttl);
        res.status(429).json({
            success:false,
            error:{
                code:"RATE_LIMIT_EXCEEDED",
                message:"Too many requests. Please try again later. ",
                retryAfterSeconds:ttl,
            }
        });
        return false; //blocked
    }
    return true; //allowed
}

// Hybrid limiter : User > Device > Fingerprint
export async function hybridRateLimiter(req:Request,res:Response,next:NextFunction){
    try {
        const {userId,deviceId,deviceFingerprint} = getClientIndentifiers(req,res);
        const config = getConfig(req);

        if(userId){
            const allowed = await applyRateLimit(`ratelimit:user:${userId}`,config,res);
            if(!allowed) return
        }

        const allowedDevice = await applyRateLimit(`ratelimit:device:${deviceId}`,config,res);
        if(!allowedDevice) return;

        const allowedFingerprint = await applyRateLimit(`ratelimit:fingerprint:${deviceFingerprint}`,config,res);
        if(!allowedFingerprint) return;

        next();
    } catch (error:any) {
        console.error("Hybrid rate limiter error:",error);
        next(); //fail-open
    }
}

// Network-level limiter(looser)
export async function networkRateLimiter(req:Request,res:Response,next:NextFunction) {
    try {
        const ipAddress = 
        (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || 
        req.socket.remoteAddress||
        "unknown"

        const networkKey = `ratelimit:network:${ipAddress}`;
        const networkLimit = 1000;
        const window = 60;

        const current = await redis.incr(networkKey);
        if(current === 1) await redis.expire(networkKey,window);

        if(current > networkLimit){
            const ttl = await redis.ttl(networkKey);
            return res.status(429).json({
                suucess:false,
                error:{
                    code:"NETWORK_RATE_LIMIT",
                    message:"Your network is making too many requests.",
                    retryAfterSeconds:ttl
                }
            })
        }

        next();
    } catch (error:any) {
        console.error("Network rate limiter error:",error);
        next();
    }
}

//Combined limiter: network + hybrid
export async function combinedRateLimiter(req:Request,res:Response,next:NextFunction) {
    await networkRateLimiter(req,res,async() => {
        await hybridRateLimiter(req,res,next);
    })
}

//Strict auth limiter(login/register brute force protection)
export async function strictAuthLimiter(req:Request,res:Response,next:NextFunction){
    try {
        const {deviceId} = getClientIndentifiers(req,res);
        if(req.user?.sub) return next();

        const deviceKey = `ratelimit:auth:device:${deviceId}`;
        const current = await redis.incr(deviceKey);

        if(current === 1) await redis.expire(deviceKey,15*60);

        if(current > 5){
            const ttl = await redis.ttl(deviceKey);
            return res.status(429).json({
                success:false,
                error:{
                    code:"AUTH_RATE_LIMIT",
                    message:"Too many login attempts, Please try again later.",
                    retryAfterSeconds:ttl
                }
            })
        }

        next();
    } catch (error:any) {
        console.error("Auth Rate Limiter Error :-",error);
        next();
    }
}

export async function softAuthLimiter(req:Request,res:Response,next:NextFunction){
    try {
        const ipAddress = 
        (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || 
        req.socket.remoteAddress||
        "unknown"

        const key = `ratelimit:oauth:${ipAddress}`;
        const limit = 30;
        const window = 60;

        const current = await redis.incr(key);

        if(current === 1) await redis.expire(key,window);

        if(current > limit){
            const ttl = await redis.ttl(key);
            return res.status(429).json({
                suucess:false,
                error:{
                    code:"OUATH_RATE_LIMIT",
                    message:"too many login attempts",
                    retryAfterSeconds:ttl
                }
            })
        }

        next();
    } catch (error:any) {
        console.error("softAuthLimiter error:", error);
        next(); // fail-open
    }
}