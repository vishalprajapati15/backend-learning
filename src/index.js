// require('dotenv').config({path: './env'})
// or you can import this file
import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'   // -r dotenv/config --experimental-json-modules ye package.json me add hua hai iske karan
});

connectDB();





































// for connection you can use normal javascript function or IIFE function

// const app = express();

// ( async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on('error', (error)=>{
//             console.log('error : ', error)
//             throw error
//         })
//         app.listen(process.env.PORT, ()=>{
//             console.log(`Application is listening on Port : ${process.env.PORT}`);
//         })

//     }
//     catch(err){
//         console.log("Database Connetion Error : ", err);
//         throw err
//     }
// })()


