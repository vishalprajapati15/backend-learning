import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

// app.use(cors())      // or you can pass object like 'origin', 'credentials' and so on.

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({limit:'16kb'}));

app.use(express.urlencoded({extended:true, limit:'16kb'}))    // or you can only pass express.urlencoded()
app.use(express.static('public'))

app.use(cookieParser());



//routes import
import userRouter from './routes/user.routes.js'

//routes declearation

// use app.use() not app.get() bcz router ko alag laya gaya ahi
app.use('/api/v1/users', userRouter)
// it looks like  https://localhost:8000/api/v1/users/'userRouter(register)'





export {app}