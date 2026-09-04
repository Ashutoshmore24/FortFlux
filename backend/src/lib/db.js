import mongoose from "mongoose";
import ENV from "../lib/env.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(ENV.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};


export default connectDB;
