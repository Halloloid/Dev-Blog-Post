import axios from "axios";
import jwt from "jsonwebtoken";
import {prisma} from "../../config/db.js"
import { Request,Response } from "express";
import { config } from "dotenv";
import crypto from "crypto"

config();

export const googleAuth = (req:Request,res:Response)=>{

    const state = crypto.randomBytes(32).toString('hex')

    res.cookie('oauth_state',state,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        maxAge:10*60*1000
    })

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/auth/google/callback"

    const url = 
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=openid email profile`+
    `&state=${state}`

    res.redirect(url);
}


export const googleCallback = async(req:Request,res:Response)=>{
    const {code,state} = req.query;

    const savedState = req.cookies.oauth_state;

    if(!state || state !== savedState) return res.status(403).json({message:"Invalid state Parameter"});

    res.clearCookie('oauth_state')
    try {
        //Exchange Code for Google Token
        const tokenRes = await axios.post(
            "https://oauth2.googleapis.com/token",
            {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/auth/google/callback",
                grant_type: "authorization_code",
                code
            }
        );

        const {access_token} = tokenRes.data;

        //Get user info
        const user_data = await axios.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }
        );

        const {email,name,picture} = user_data.data;
        const user = await prisma.user.upsert({
            where:{email},
            update:{
                full_name:name,
                avatar_url:picture
            },
            create:{
                email:email,
                full_name:name,
                avatar_url:picture
            }
        })

        //Create the JWT 
        const jwtToken = jwt.sign(
            {
              sub: user.id,
              email:user.email
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        //Set httpOnly cookie
        res.cookie("access_token",jwtToken,{
            httpOnly:true,
            secure:true, //Make sure to change it to true in production
            sameSite:"none",
            maxAge:60*60*1000
        });

        res.redirect(process.env.FRONTEND_URL!);

    } catch (error:any) {
        console.error(error);
        res.status(500).json({"message":"Google auth failed"})
    }
}

export const logout = (req:Request,res:Response)=>{
    res.clearCookie("access_token");
    res.json({"message":"Logged Out"});
};

export const getMe = async(req:Request,res:Response) => {
    try {
        const token = req.cookies.access_token
        if(!token) return res.status(401).json({message:"Not Logged in User"});

        const decode:any = jwt.verify(token,process.env.JWT_SECRET!)
        const user = await prisma.user.findUnique({
            where:{id:decode.sub},
            select:{
                id:true,
                full_name:true,
                avatar_url:true,
                user_name:true
            }
        })

        res.json(user)
    } catch (error) {
        res.status(401).json({message:"Invalid Token"})        
    }
}
