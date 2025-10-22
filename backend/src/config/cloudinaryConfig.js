import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pics",
    allowed_formats: ["jpg", "png"],
  },
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 2 MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only jpg, jpeg, png
    if (!file.mimetype.match(/jpeg|jpg|png/)) {
      cb(new Error("Only jpg, jpeg, and png files are allowed!"), false);
    } else {
      cb(null, true);
    }
  },
});
