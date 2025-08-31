// require('dotenv').config({path: './env'})
// or you can import this file
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path: './.env'   // -r dotenv/config --experimental-json-modules ye package.json me add hua hai iske karan
});

connectDB()  // it is an async function, jab bhi complete hota hai to ek promise return krta hai 
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`Server is listening on PORT : ${process.env.PORT}`);
    });
})
.catch((err) =>{
    console.log('MongoDb connection failed !!! :', err);
});




































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


