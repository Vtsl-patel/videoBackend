import mongoose from "mongoose"
import dotenv from "dotenv"
import DB_NAME from "constants"
import connectDB from "./db/index.js"

dotenv.config({
    path: "./env"
});

connectDB();