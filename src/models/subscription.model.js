import mongoose, { Schema }from "mongoose";


const subsctiptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, //one who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, //one whom to subscriber is subscribing
        ref:"User"
    },
},{timestamps:true})




export const Subscription = mongoose.model("Subscription", subsctiptionSchema)
