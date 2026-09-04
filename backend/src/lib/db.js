import mongoose from "mongoose";
import ENV from "../lib/env.js";

const connectDB = async () => {
    if (!ENV.MONGODB_URI) {
        console.error("❌ MongoDB connection error: MONGODB_URI is missing in backend/.env");
        console.error("👉 Please create backend/.env from backend/.env.example and provide your MongoDB connection string.");
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(ENV.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};


export default connectDB;
