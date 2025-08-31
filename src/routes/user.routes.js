import { Router } from "express";
import { registerUser } from "../controllers/user.controlle.js";
import { upload } from "../middlewares/multer.middleware.js";



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





export default router