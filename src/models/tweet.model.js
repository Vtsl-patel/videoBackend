import mongoose, {Schema, model} from "mongoose";

const tweetSchema = new Schema(
    {
        content: {
            typeof: String,
            required: true,
        },
        owner: {
            types: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Tweet = mongoose.model("Tweet", tweetSchema)