import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controlle.js";
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



export default router