import mongoose, {Schema, model} from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            typeof: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            typeof: Schema.Types.ObjectId,
            ref: "Comment"
        },
        likedBy: {
            typeof: Schema.Types.ObjectId,
            ref: "User"
        },
        tweet: {
            typeof: Schema.Types.ObjectId,
            ref: "Tweet"
        },
    },
    {
        timestamps: true
    }
)

export const Like = mongoose.model("Like", likeSchema)