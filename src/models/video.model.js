import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videofile:{
        type:String,         //cloudnery url
        required:true
    },
    thumbnail:{
        type:String,         //cloudnery url
        required:true
    },
    title:{
        type:String,         
        required:true
    },
    description:{
        type:String,         
        required:true
    },
    duration:{
        type:Number,         
        required:true
    },
    views:{
        type:Number,
        default:0 
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    isOwner:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }

}, {timestamps:true})

videoSchema.plugin (mongooseAggregatePaginate)              // for aggregation queries

export const Video = mongoose.model('Video', videoSchema);