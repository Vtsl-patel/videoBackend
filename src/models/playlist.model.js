import mongoose, {Schema, model} from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            typeof: String,
            required: true
        },
        description: {
            typeof: String
        },
        videos: [
            {
                typeof: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        owner: {
            typeof: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Playlist = mongoose.model("Playlist", playlistSchema)