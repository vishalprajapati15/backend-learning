import { v2 as cloudinary } from "cloudinary";
import fs from 'fs' //filesystem

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath )=>{
    try {
        if(!localFilePath) return null      // if local file path not found return null
        const response = await cloudinary.uploader.upload(localFilePath, {         //upload file to cloudinary
            resource_type:"auto"            // check resourse type
        })
        fs.unlinkSync(localFilePath) // if there is any error in uploading file and succesfully upload file on cloudinary file will be deleted from local storage.
        //file has been uploaded successfully
        // console.log("File is uploaded on cloudinary : ", response.url)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath)            // remove the locally saved temporary file as the upload operartion got failed
        return null
    }
}



export {uploadOnCloudinary}