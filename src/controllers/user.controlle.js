import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false}) // it skip validation while saving user data (required field) like (password, etc.)

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating refresh and acsess token.')
    }
}

const registerUser = asyncHandler( async (req, res) =>{
   /* get user details fom frontend
    validation -not empty
    check if user already exists   by username and email 
    check for images and avatar upload them to cloudinary
    create user object for NoSQL DB, create entry in db 
    remove password and refresh token field from response
    check for user creation
    return response 
    */

    // get user details fom frontend
    const {fullName, email, username, password} = req.body

    // validation -not empty

   /* if(fullName === ""){
        throw new ApiError(400, 'Full name is required.')
    } */

    // Or you can multuple conditions in an array like 
    
    if([fullName, email, username, password].some((field) => 
    field?.trim() === "")){
        throw new ApiError(400, 'All fields are required.')
    }

    // check if user already exists   by username and email 

     const existedUser = await User.findOne({
        $or:[{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, 'User with email or username  already exists.')
    }

    // console.log('req.files : ', req.files)

 
    // check for images and avatar upload them to cloudinary

    const avatarLocalPath = req.files?.avatar[0]?.path;

    // req.files is multer method 
    // const coverImageLocalPath = req.files?.coverImage[0]?.path          //it show an error if cover image is not send. alternate option is following
    
    let coverImageLocalPath ;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path                            // this method doesn't throw any error if cover image is not send, in db it store an empty string in front of coverImage if coverImage is not send   
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required.')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, 'Avatar file is required.')
    }

    // create user object for NoSQL DB, create entry in db 
    const user = await User.create({
        fullName,
        avatar:avatar.url,      // cloudinary url
        avatarPublicId:avatar.public_id,
        coverImage:coverImage?.url || "",      // if cover image is given this store coverImage's cloudinary url else store it empty string
        coverImagePublicId:coverImage?.public_id,
        email,
        password,
        username:username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"           //select those field which is not required in user object,
    )

    // check for user creation
    if(!createdUser){
        throw new ApiError(500, 'Something went wrong while regestering the user !!!')
    }

    // return response 
    return res.status(201).json(
        new ApiResponse(201, createdUser, 'User registered successfully  !!!')
    )

})

const loginUser = asyncHandler(async (req, res) => {
    /*get data from req.body
    username and email or 
    find the user  
    if user exist check password
    generate access and refresh token and send to user
    send cookie
    send response
    */

    // get data from req.body
    const {username, email, password} = req.body

    // check username and email or

    if(!username && !email){        // check if username or email exists
        throw new ApiError(400, 'Username and email is required.')  //if not exist throw an error
    }
    //find the user in db
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user){ 
        throw new ApiError(404, 'User does not exist')      //if user does not exist in db throw an error
    }
    
    // check user's password is correct or not

    const isPasswordValid = await user.isPasswordCorrect(password)  
    // console.log(isPasswordValid)

    //if passwor is incorrect

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid user password.') 
    }
    // generate access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)      //this give accessToken and refreshToken 
    // remove password and refreshToken from loggedUser object
    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true,
    }       //(Not modifiable cookies) by use of this options object,  only server can modify cookies; not user from frontend

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)      // you can send multiple cookies (like this) user cannot modify these tokens
    .json(
        new ApiResponse(
            200,
            {
                user: loggedUser, accessToken, refreshToken    // if user want to save these data in local storage 
            } ,
            'User Logged in successfully!!'
        )
    )
})

const logoutUser = asyncHandler(async(req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken: undefined}
        },
        {
            new:true    // in response it provide new updated value
        }
    )

    const options = {
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out!!"))
})


const refreshAccessToken = asyncHandler(async (req, res)=> {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options ={
            httpOnly: true,
            secure:true
        }
    
        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id)      // rename new generated refresh token with "newRefreshToken"
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "Access token refreshed successfully."
            )
        )
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})


const changeCurrentPassword = asyncHandler(async (req, res)=>{
    // get newPassword and oldPassword from frontend 
    const {oldPassword, newPassword } = req.body


    const user = await User.findById(req.user?._id)
    // check old password is correct or not
    const isPassworrdCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPassworrdCorrect) {
        throw new ApiError(400, "Invalid old password.")
    }
    // set new password in existing user object
    user.password = newPassword
    // save password into db 
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200,  {}, "Password changed Successfully."))

} )

const getCurrentUser = asyncHandler(async(req, res) =>{
    return res.status(200)
    .json(new ApiResponse(200, req.user, "Current user fetch successfully."))
})


const updateUserDetails = asyncHandler(async(req, res)=>{
    const {fullName, username, email} = req.body

    if(!fullName || !username || !email){
        throw new ApiError(400, "All fields are required.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,       // or fullname : fullname {fullname is es6 typo}
                email,
                username
            }    
        },
        {
            new:true    // it return informantion after update
        }
    ).select("-password") // remove password field from user object

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Account Details Updated Successfully.")
    )
})


const updateUserAvatar = asyncHandler(async(req, res) =>{

    const avatarLocalPath = req.file?.path                    // for single file "req.file" and for multiple files "req.files"

    if (!avatarLocalPath) {
        throw new ApiError(200, "Avatar file is required.")
    }
    
    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(404, "User not found.")
    }

    if (user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id)         // older avatar deleted.
    }

    const newAvatar = await uploadOnCloudinary(avatarLocalPath)

    if(!newAvatar?.url || !newAvatar?.public_id){
        throw new ApiError(400, "Error while uploading avatar file." )
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
             avatar:newAvatar,
             avatarPublicId:newAvatar.public_id         // avatar public id added
            }
        },
        {
            new:true
        }
    ).select("-password")


    return res.status(200)
    .json(
        new ApiResponse(200, updatedUser ,"Avatar file is updated successfully.")
    )

})


const updateCoverImageAvatar = asyncHandler(async(req, res) =>{

    const coverImageLocalPath = req.file?.path                    // for single file "req.file" and for multiple files "req.files"

    if (!coverImageLocalPath) {
        throw new ApiError(200, "Cover Image file is required.")
    }

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(404, "User not found.")
    }

    if (user.coverImage?.public_id) {
        await cloudinary.uploader.destroy(user.coverImage.public_id)         // older avatar deleted.
    }

    const newCoverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!newCoverImage?.url || !newCoverImage?.public_id){
        throw new ApiError(400, "Error while uploading Cover Image file." )
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
             coverImage:newCoverImage.url,
             coverImagePublicId:newCoverImage.public_id
            }
        },
        {
            new:true
        }
    ).select("-password")


    return res.status(200)
    .json(
        new ApiResponse(200, updatedUser ,"Cover Image file is updated successfully.")
    )

})


const getUserChannelProfile = asyncHandler(async(req, res) =>{
    const { username } = req.params         // getting username from url by using req.params

    if(!username?.trim()){              //optionally trim if user exist
        throw new ApiError(400, 'Username is missing.')
    }

    const channel = await User.aggregate([{            // find username and aggregate, it provide output in form of array of object.
        $match: { 
            username: username?.toLowerCase() 
        },    
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        },
        $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        },
        $addFields:{
            subscribersCount:{
                $size: "$subscribers"            // $ bcz subscriber is now a field.
            },
            channelsSubscribedToCount:{
                $size:"$subscribedTo "
            },
            isSubscribed:{
                $cond: {
                    if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
        },
        $project:{
            fullName: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1 ,
            avatar: 1,
            coverImage: 1,
            email: 1,
        }
    }]);
    
    if(!channel?.length){
        throw new ApiError(404, 'Channel does not exists.')
    }

    return res.status(200)
    .json(
        new ApiResponse(200, channel[0], 'User channel fetched successfully.')
    )

})

const getWatchHistory = asyncHandler(async(req, res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])


    return res.status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "Watch History fetched.")
    )
})

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateCoverImageAvatar,
    getUserChannelProfile,
    getWatchHistory
}