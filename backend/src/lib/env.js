import dotenv from "dotenv";
dotenv.config();

const ENV = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 6000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || "fortflux_jwt_secret_dev_key_2025",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "4d",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    ARCJET_KEY: process.env.ARCJET_KEY,
    ARCJET_ENV: process.env.ARCJET_ENV,
};

export default ENV;

