import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const veriftJWt = asyncHandler( async (req, _ , next) => {
    try {
        // step-1 get token from cookie
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "")
        if(!token){
            throw new ApiError(401, "unauthorized request . Token not found")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if(!decodedToken){
            throw new ApiError(500, "Failure in decoding access token")
        }
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(400, "Invalid access token")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(400, error.message || "accesstoken not available")
    }
})