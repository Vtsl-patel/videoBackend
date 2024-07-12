import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    
    // get channelId from req->params and userId from req->user
    const userId = req.user?._id
    const { channelId } = req.params
    if(!channelId.trim()){
        throw new ApiError(400, "Invalid channelId")
    }

    // check if subscription already exists
    const subscribed = await Subscription.aggregate([
        {
            $match: {
                subscriber: userId,
                channel: new mongoose.Types.ObjectId(channelId)
            }
        }
    ])

    // toggle according to status of subscribed 
    if(subscribed.length === 0){
        const subscription = await Subscription.create({
            subscriber: userId,
            channel: new mongoose.Types.ObjectId(channelId)
        })
        if(!subscription){
            throw new ApiError(400, "Invalid channelId")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, subscription, "Channel subscribed successfully")
        )
    } else {
        const subscription = await Subscription.findByIdAndDelete(subscribed._id)
        if(!subscription){
            throw new ApiError(400, "Error while unsubscribing channel : Try again later")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Channel unsubscribed successfully")
        )
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // TODO: subscriber list of a channel

    // get channelId from req->params
    const { channelId } = req.params
    if(!channelId.trim()){
        throw new ApiError(400, "Invalid channelId")
    }

    // get list of subscribers from db
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscriber"
                }
            }
        },
        {
            $project: {
                subscriber: 1
            }
        }
    ])
    if(!subscribers){
        throw new ApiError(400, "Inavlid channelId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribers, "Channel subscribers fetched succsessfully")
    )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    // TODO: channel list to which user has subscribed

    // get userId or subscriberId from req->params
    const { channelId } = req.params
    const subscriberId = channelId
    if(!subscriberId.trim()){
        throw new ApiError(400, "Inavlid userId")
    }

    // get channel list from db
    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                channels: {
                    $first: "$channels"
                }
            }
        },
        {
            $project: {
                channels: 1
            }
        }
    ])
    if(!channels){
        throw new ApiError(400, "Invalid userId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channels, "Subscribed channel list fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}