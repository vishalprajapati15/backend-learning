import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () =>{
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)     // connextion ke baad ka response connectionInstance hold karega. 
        console.log(`\n MongoDB connected !! DB HOST ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log('MongoDb connection failed : ', error)
        process.exit(1); //used to end the running process, (1= Exit with failure and 0 = Exit with success)  or you can throw the error 
    }
}


export default connectDB