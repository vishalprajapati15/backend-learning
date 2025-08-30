import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, '.public/temp')
    },
    filename: function(req, file, cb){
        // const uniqueSuffix =Date.now() + '-' + Math.round(Math.random() * 1E9)
        // cb(null, file.fieldname + '-' + uniqueSuffix)                                for unique file name

        cb(null, file.originalname)         // it save file with original name (which is provided by user)
    }
})

 export const upload = multer({
    storage,        // or  storage: storage 
})