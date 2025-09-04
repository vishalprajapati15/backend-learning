import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserDetails, 
    updateUserAvatar, 
    updateCoverImage, 
    getUserChannelProfile, 
    getWatchHistory 
} from "../controllers/user.controlle.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router();


router.route('/register').post(
    upload.fields([              //this is upload (multer,middleware file) executes before registerUser, 
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

// secure routes 
// Note middleware ka reference provide krte hai execute nhi
router.route('/logout').post(verifyJWT ,logoutUser)     // verifyJWT middleware added before logout user  

router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account').patch(verifyJWT, updateUserDetails)
router.route('/avatar').patch(verifyJWT,upload.single("avatar"), updateUserAvatar)
router.route('/cover-image').patch(verifyJWT, upload.single("coverImage"),  updateCoverImage)
router.route('/c/:username').get(verifyJWT,  getUserChannelProfile)
router.route('/history').get(verifyJWT, getWatchHistory)




export default router