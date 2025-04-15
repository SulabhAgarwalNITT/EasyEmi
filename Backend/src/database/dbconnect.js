import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config();

async function connectDB(){
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`)
        console.log(`MongoDB connected DB host:  ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection Failed : ", error.message);
        process.exit(1)
    }
}

export default connectDB;