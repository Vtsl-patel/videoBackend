import mongoose, { Model } from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one wjo is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom subscriber is subscribing
        ref: "User",
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subcription", subscriptionSchema)