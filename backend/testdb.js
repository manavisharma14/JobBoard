import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

(async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected!");
    } catch (err) {
        console.error("❌ Connection error:", err.message);
    }
})();
