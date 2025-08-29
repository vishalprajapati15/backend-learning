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





export {app}