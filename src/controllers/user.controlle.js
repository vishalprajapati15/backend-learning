import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'


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
            throw new ApiError(401, "Refresh toke is expired or used")
        }
    
        const options ={
            httpOnly: true,
            secure:true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
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


export { registerUser, loginUser, logoutUser, refreshAccessToken }