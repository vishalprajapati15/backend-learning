import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";


// sometimes you use "req" and "next" but not "res", you can replace res with "_"
export const verifyJWT = asyncHandler(async (req, res, next)=>{         // if cookies is not available (mobile devices) the user req. header
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")    // ? = options cookies is present or not, .replace-> replace Bearesr with empty string
    
        if(!token){
            throw new ApiError(401, "Unauthorized request .")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")       // in user.model.js file stored in userSchema
    
        if(!user) {
            // NEXT_CHAPTER  Discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user         // add user object in request's user object
    
        next()
    } catch (error) {
        throw new ApiError(401, error?.messgae || "Invalid Access Token.")
    }

})