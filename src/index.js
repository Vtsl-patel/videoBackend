import mongoose from "mongoose"
import dotenv from "dotenv"
import DB_NAME from "constants"
import connectDB from "./db/index.js"
import app from "./app.js"

dotenv.config({
    path: "./env"
});

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error : ", error);
        throw error;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MongoDB connection error : ", error);
})