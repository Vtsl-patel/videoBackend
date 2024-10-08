import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler( async(req, res, next) => {
    try {
        // get token from cookies (browser) or from header file (mobile apps)
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        // decode and verify token using jwt access token secret
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        // db call to find user using ID from decoded token
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        // add new field "user" in req body
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})