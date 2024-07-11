import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // TODO: create tweet

    // get content from req->body and user from req->user
    const { content } = req.body
    const userId = req.user?._id
    if(!content.trim()){
        throw new ApiError(400, "Tweet body can't be empty")
    }

    // create a tweet
    const tweet = await Tweet.create({
        content,
        owner: userId
    })
    if(!tweet){
        throw new ApiError(400, "Tweet can't be created")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet published successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    // get userId from req->params
    const { userId } = req.params
    if(!userId.trim()){
        throw new ApiError(400, "Invalid userId (empty)")
    }

    // get tweets of user from db
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    },
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])
    if(!tweets){
        throw new ApiError(400, "Inavlid userId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    // TODO: update tweet

    // get content of tweet from req->body and tweetId from req->params
    const { tweetId } = req.params
    const { content } = req.body
    if(!content.trim()){
        throw new ApiError(400, "Tweet body can't be empty")
    }
    if(!tweetId.trim()){
        throw new ApiError(400, "Invalid tweetId")
    }

    // update tweet in db
    const tweet = await Tweet.findByIdAndUpdate(
        new mongoose.Types.ObjectId(tweetId),
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )
    if(!tweet){
        throw new ApiError(400, "Invalid tweetId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    // TODO: delete tweet

    // get tweetId from req->params
    const { tweetId } = req.params
    if(!tweetId.trim()){
        throw new ApiError(400, "Inavlid tweetId")
    }

    // delete tweet from db
    const tweet = await Tweet.findByIdAndDelete(new mongoose.Types.ObjectId(tweetId))
    if(!tweet){
        throw new ApiError(400, "Invalid tweetId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}