import multer from "multer";

//Storing the data in the Client memorey first
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits:{fileSize:5*1024*1024}
});