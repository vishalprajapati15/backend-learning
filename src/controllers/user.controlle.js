import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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
    const avatarLocalPath = req.files?.avatar[0]?.path;                  // req.files is multer method 
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
        coverImage:coverImage?.url || "",      // if cover image is given this store coverImage's cloudinary url else store it empty string
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
        new ApiResponse(200, createdUser, 'User registered successfully  !!!')
    )

})


export {registerUser}