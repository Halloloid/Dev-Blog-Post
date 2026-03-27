import { Request,Response } from "express";
import { prisma } from "../../config/db.js";
import { redis } from "../../config/redis.js";
import cloudinary from "../../config/cloudinary.js";
import crypto from "crypto"
import { trackPostView } from "./view.service.js";
import sharp from "sharp";

const allowedMime = new Set(["image/png", "image/jpeg", "image/jpg", "image/gif"]);
const allowedExt = new Set(["png", "jpg", "jpeg", "gif"]);
const dangerousExt = new Set(["php", "phtml", "phar", "phps", "php5", "php7", "php8"]);

const uploadPostImage = async(file: Express.Multer.File) => {
    if(!allowedMime.has(file.mimetype)) {
        throw new Error("Only PNG, JPG or GIF images are allowed");
    }

    const originalName = (file.originalname || "").toLowerCase();
    const parts = originalName.split(".").filter(Boolean);
    const lastExt = parts.length > 0 ? parts[parts.length - 1] : "";
    const hasDangerous = parts.slice(0, -1).some((ext) => dangerousExt.has(ext));
    if(!allowedExt.has(lastExt) || hasDangerous) {
        throw new Error("Invalid image filename");
    }

    const buffer = file.buffer;
    const isPng = buffer.length >= 8 &&
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
        buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A;
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isGif = buffer.length >= 6 &&
        buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 &&
        (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61;

    if(!isPng && !isJpeg && !isGif) {
        throw new Error("Invalid image file");
    }

    if(file.size > 5 * 1024 * 1024) {
        throw new Error("File Too Large(Max 5MB)");
    }

    let uploadBuffer = file.buffer;
    try {
        uploadBuffer = await sharp(file.buffer, { animated: true })
            .webp({ quality: 90 })
            .toBuffer();
    } catch (error:any) {
        console.error("Image compression failed", error);
        throw new Error("Invalid image file");
    }

    const streamUpload = (fileBuffer:Buffer) => {
        return new Promise<any>((resolve,reject)=>{
            const stream = cloudinary.uploader.upload_stream(
                {folder:"posts", format:"webp"},
                (error,result) => {
                    if(result) resolve(result);
                    else reject(error)
                }
            );
            stream.end(fileBuffer)
        })
    }

    return streamUpload(uploadBuffer);
};

const normalizeTagIds = (input: unknown) => {
    if(input === undefined) return null;

    const values = Array.isArray(input) ? input : [input];
    const normalized = values
        .flatMap((value) => typeof value === "string" ? value.split(",") : [])
        .map((value) => value.trim())
        .filter(Boolean);

    return Array.from(new Set(normalized));
};

export const posts = async(req:Request,res:Response)=>{
    
    try {
        const page = 
            typeof req.query.page === "string" ? Number(req.query.page) : 1;
        const limit =
            typeof req.query.limit === "string" ? Number(req.query.limit) : 5;
            
        const safePage = page > 0 ? page : 1;
        const safeLimit = limit > 0 ? limit : 5;    
        const skip = (safePage-1)*safeLimit 
        
        
        const validSortFields=['created_at','view_count','likes_count']
        const sortBy = 
        typeof req.query.sortBy === "string" && validSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'created_at';
        
        const sortOrder = 
        typeof req.query.sortOrder === "string" && ['asc','desc'].includes(req.query.sortOrder.toLowerCase()) ? req.query.sortOrder.toLowerCase() : 'desc';
        
        const tags = 
        typeof req.query.tags === "string" ? req.query.tags.split(",").map(t=>t.trim()).filter(Boolean) : [];
        
        const q = 
        typeof req.query.q === "string" ? req.query.q.trim() : null;
        
        const where:any = {
            status:"published"
        }
        
        if(tags.length > 0){
            where.tags = {
                some:{
                    tag:{
                        slug:{
                            in:tags,
                        }
                    }
                }
            }
        }
        
        if(q){
            where.OR = [
                {title:{contains: q ,mode:"insensitive"}},
                {exceprt:{contains:q,mode:"insensitive"}}
            ]
        }
        
        // Redis Cache for Home Page
        const shouldCahce = 
            safePage === 1 &&
            !q &&
            tags.length === 0 &&
            sortBy === "created_at" &&
            sortOrder === "desc";

        const cacheKey = shouldCahce  
            ? `posts:homepage`
            : null;

        if(shouldCahce){
            const cachedData = await redis.get(cacheKey!);
            if(cachedData){
                return res.status(200).json(cachedData);
            }
        }
            
            
        // database Queries
        const totalCount = await prisma.post.count({where})
        const posts = await prisma.post.findMany({
            where:where,
            take:safeLimit ,
            skip:skip ,
            orderBy:{
                [sortBy] : sortOrder as 'asc' | 'desc'
            },
            include:{
                tags:{
                    select:{
                        tag:{
                            select:{
                                id:true,
                                slug:true,
                                name:true
                            }
                        }
                    }
                },
                user:{
                    select:{
                        id:true,
                        full_name:true
                    }
                }
            }
        });

        const formattedPosts = posts.map(post => ({
            ...post,
            tags:post.tags.map(t => t.tag)
        }))
        const totalPages = Math.ceil(totalCount/safeLimit);
        const responsePayload = {
            currentPage: safePage,
            perPage: safeLimit,
            totalCount:totalCount,
            totalPages:totalPages,
            sortBy,
            sortOrder,
            tag:tags.length>0 ? tags : "all",
            data:formattedPosts
        }

        //Save to Redis
        if(shouldCahce){
            await redis.set(cacheKey!,responsePayload,{
                ex:300
            })
        }


        return res.status(200).json(responsePayload)
    } catch (error:any) {
        console.error(error)
        res.status(500).json({status:"error",message:"Something Went Wrong  "})
    }
}

export const specificPost = async(req:Request,res:Response) => {
    try {
        const {id} = req.params;

        if (typeof id !== "string"){
            return res.status(400).json({message:"Invalid Post Id"})
        }

        const cacheKey = `post:${id}`

        const cachedPost = await redis.get(cacheKey);
        if(cachedPost){
            return res.status(200).json(cachedPost);
        }
        const post = await prisma.post.findUnique({
            where:{id},
            include:{
                comments:{
                    where:{
                        parent_comment_id:null
                    },
                    orderBy:{
                        created_at:"desc"
                    },
                    select:{
                        id:true,
                        content:true,
                        created_at:true,
                        author:{
                            select:{
                                id:true,
                                user_name:true,
                                avatar_url:true
                            }
                        },
                        _count:{
                            select:{
                                replies:true
                            }
                        }
                    }
                },
                tags:{
                    select:{
                        tag:{
                            select:{
                                id:true,
                                name:true,
                                slug:true
                            }
                        }
                    }
                },
                user:{
                    select:{
                        id:true,
                        full_name:true,
                        user_name:true,
                        avatar_url:true,
                        bio:true,
                        total_followers:true
                    }
                }
            }
        })
        if(!post){
            return res.status(404).json({message:"Post Not found"});
        }

        const formattedPost = {
            ...post,
            tags:post.tags.map(t=>t.tag),
            comments:post.comments.map(c=>({
                id:c.id,
                content:c.content,
                created_at:c.created_at,
                author:c.author,
                replisCount:c._count.replies
            }))
        }

        await redis.set(cacheKey,formattedPost,{
            ex:600
        })
        res.status(200).json(formattedPost);


        const viewerId = req.user?.sub
            ?? crypto
                .createHash("sha256")
                .update(req.ip + (req.headers["user-agent"] || ""))
                .digest("hex")
        
        trackPostView(id,viewerId)
    } catch (error:any) {
        res.status(500).json({message:"Server Error"})
    }
}

export const editablePost = async(req:Request,res:Response) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ message: "Invalid Post Id" });
        }

        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const post = await prisma.post.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                content: true,
                exceprt: true,
                repo_link: true,
                featured_img: true,
                status: true,
                created_by: true,
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        user_name: true
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ message: "Post Not found" });
        }

        if (post.created_by !== userId) {
            return res.status(403).json({ message: "You cannot edit others posts" });
        }

        return res.status(200).json({
            ...post,
            tags: post.tags.map((item) => item.tag)
        });
    } catch (error:any) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const createPost = async(req:Request,res:Response) => {
    try {
        const user = req.user as {sub : string}
        if(!user?.sub) return res.status(401).json({message:"Unauthorized"});

        const {title,content,repo_link,exceprt,status,tags} = req.body;
        const postStatus = status || "draft"

        if(postStatus === "published"){
            if(!title||!content||!req.file||!exceprt){
                return res.status(400).json({message:"Missing Required Field"})
            }
            if(tags && !Array.isArray(tags)){
                return res.status(400).json({message:"Tags must be in the array"})
            }
        }

        let result:any = null
        if(req.file){
            try {
                result = await uploadPostImage(req.file);
            } catch (error:any) {
                return res.status(400).json({message:error.message || "Invalid image file"});
            }
        }
        

        const post = await prisma.post.create({
            data:{
                title,
                content,
                repo_link,
                featured_img:result?.secure_url || null,
                exceprt,
                status: postStatus,
                created_by: user.sub,
                tags:tags?{
                    create:tags.map((tagId:string)=>({
                        tag:{
                            connect:{id:tagId}
                        }
                    }))                
                }
                :undefined
            },
            include:{
                tags:{
                    include:{
                        tag:true
                    }
                }
            }
        });

        res.status(201).json({message:"Post Created Successfully",post});

    } catch (error:any) {
        console.error(error)
        res.status(500).json({message:"Failed to create the post"})
    }
};

export const updatePost = async(req:Request,res:Response) => {
    try {
        const {id} = req.params;
        if (typeof id !== "string"){
            return res.status(400).json({message:"Invalid Post Id"})
        }
        const userId = req.user!.sub;
        const post = await prisma.post.findUnique({
            where:{id},
            include:{
                tags:{
                    select:{
                        tag_id:true
                    }
                }
            }
        })

        if(!post) return res.status(404).json({message:"Post Not Found"});

        if(post.created_by !== userId) return res.status(403).json({message:"You cannot Update Others Posts"});

        const isDraftPost = post.status === "draft";
        const allowedFields = isDraftPost
            ? ["title", "content", "exceprt", "repo_link", "status"]
            : ["title", "content", "exceprt", "repo_link"];
        const dataToUpdate: any = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                dataToUpdate[field] = req.body[field];
            }
        }

        const parsedTags = isDraftPost
            ? normalizeTagIds(req.body["tags[]"] ?? req.body.tags)
            : null;
        const nextStatus =
            isDraftPost && (req.body.status === "draft" || req.body.status === "published")
                ? req.body.status
                : post.status;

        if (req.file) {
            try {
                const uploadedImage = await uploadPostImage(req.file);
                dataToUpdate.featured_img = uploadedImage.secure_url;
            } catch (error:any) {
                return res.status(400).json({message:error.message || "Invalid image file"});
            }
        }

        if (parsedTags) {
            dataToUpdate.tags = {
                deleteMany: {},
                create: parsedTags.map((tagId:string)=>({
                    tag:{
                        connect:{id:tagId}
                    }
                }))
            };
        }

        if (isDraftPost) {
            dataToUpdate.status = nextStatus;

            if (nextStatus === "published") {
                const resultingTitle = dataToUpdate.title ?? post.title;
                const resultingContent = dataToUpdate.content ?? post.content;
                const resultingExcerpt = dataToUpdate.exceprt ?? post.exceprt;
                const resultingRepoLink = dataToUpdate.repo_link ?? post.repo_link;
                const resultingImage = dataToUpdate.featured_img ?? post.featured_img;
                const resultingTags = parsedTags ?? post.tags.map((item) => item.tag_id);

                if(!resultingTitle || !resultingContent || !resultingExcerpt || !resultingRepoLink || !resultingImage){
                    return res.status(400).json({message:"Missing Required Field"});
                }

                if(resultingTags.length === 0){
                    return res.status(400).json({message:"At least one tag is required"});
                }
            }
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update",
            });
        }

        const updatePost = await prisma.post.update({
            where:{id},
            data:dataToUpdate,
            include:{
                tags:{
                    select:{
                        tag:{
                            select:{
                                id:true,
                                name:true,
                                slug:true
                            }
                        }
                    }
                }
            }
        })

        //redis cache invalidation
        try {
            await redis.del("posts:homepage")
            await redis.del(`post:${id}`)
            console.log("Redis Cache Deleted for Page1")
        } catch (error:any) {
            console.error("Redis Cache Delete Error",error)
        }
        res.status(200).json({
            ...updatePost,
            tags:updatePost.tags.map((item)=>item.tag)
        })
    } catch (error:any) {
        console.error(error)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const deletePost = async(req:Request,res:Response) => {
    try {
        const {id} = req.params;

        if(typeof id !== "string") 
            return res.status(400).json({message:"Invalid Post Id"});

        const userId = req.user!.sub;
        const deleted = await prisma.post.deleteMany({
            where:{
                id,
                created_by:userId
            }
        })

        if(deleted.count === 0){
            return res
            .status(403)
            .json({message:"Post not found or Not Allowed"})
        }
        try {
            await redis.del("posts:homepage")
            console.log("Redis Cache Deleted for Page1")
        } catch (error:any) {
            console.error("Redis Cache Delete Error",error)
        }
        res.status(204).send()
    } catch (error:any) {
        console.error(error)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const publishPost = async(req:Request,res:Response) => {
    try {
        const {id} = req.params;
        if(typeof id !== "string") return res.status(400).json({message:"Invalid Post ID"});

        const userId = req.user?.sub;

        const updated = await prisma.post.updateMany({
            where:{
                id,
                created_by:userId,
                status:{in : ["draft","archived"]}
            },
            data:{
                status:"published"
            }
        })

        if(updated.count === 0){
            return res.status(403).json({message:"Post not found Unauthorized"})
        }

        try {
            await redis.del("posts:homepage")
            console.log("Redis Cache Deleted for Page1")
        } catch (error:any) {
            console.error("Redis Cache Delete Error",error)
        }

        return res.status(200).json({message:"Post Published Successfully"})
    } catch (error:any) {
        console.error(error);
        res.status(500).json({message:"Internal Server Error"})
    }
}
