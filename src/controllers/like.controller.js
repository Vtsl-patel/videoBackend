import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    // TODO: toggle like on video

    // get videoId from req->params and userId from req->user 
    const userId = req.user?._id
    const { videoId } = req.params
    if(!videoId.trim()){
        throw new ApiError(400, "Invalid videoId")
    }

    // check for videolike in db
    const videoLike = await Like.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
                likedBy: userId
            }
        }
    ])

    // toggle according to status of liked
    if(videoLike.length === 0){
        const videoLiked = await Like.create({
            video: new mongoose.Types.ObjectId(videoId),
            likedBy: userId
        })
        if(!videoLiked){
            throw new ApiError(400, "Inavlid videoId")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, videoLiked, "Video liked successfully")
        )
    } else {
        const videoUnliked = await Like.findByIdAndDelete(videoLike[0]._id)
        if(!videoUnliked){
            throw new ApiError(400, "Inavlid videoId")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video like removed successfully")
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    // TODO: toggle like on comment

    // get commentId from req->params and userId from req->user 
    const userId = req.user?._id
    const {commentId} = req.params
    if(!commentId.trim()){
        throw new ApiError(400, "Invalid commentId")
    }

    // check for commentlike in db
    const commentLike = await Like.aggregate([
        {
            $match: {
                comment: new mongoose.Types.ObjectId(commentId),
                likedBy: userId
            }
        }
    ])

    // toggle according to status of liked
    if(commentLike.length === 0){
        const commentLiked = await Like.create({
            comment: new mongoose.Types.ObjectId(commentId),
            likedBy: userId
        })
        if(!commentLiked){
            throw new ApiError(400, "Inavlid commentId")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, commentLiked, "comment liked successfully")
        )
    } else {
        const commentUnliked = await Like.findByIdAndDelete(commentLike[0]._id)
        if(!commentUnliked){
            throw new ApiError(400, "Inavlid commentId")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "comment like removed successfully")
        )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    // TODO: toggle like on tweet
    
    // get tweetId from req->params and userId from req->user 
    const userId = req.user?._id
    const {tweetId} = req.params
    if(!tweetId.trim()){
        throw new ApiError(400, "Invalid tweetId")
    }

    // check for tweetlike in db
    const tweetLike = await Like.aggregate([
        {
            $match: {
                tweet: new mongoose.Types.ObjectId(tweetId),
                likedBy: userId
            }
        }
    ])

    // toggle according to status of liked
    if(tweetLike.length === 0){
        const tweetLiked = await Like.create({
            tweet: new mongoose.Types.ObjectId(tweetId),
            likedBy: userId
        })
        if(!tweetLiked){
            throw new ApiError(400, "Inavlid tweetId")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, tweetLiked, "tweet liked successfully")
        )
    } else {
        const tweetUnliked = await Like.findByIdAndDelete(tweetLike[0]._id)
        if(!tweetUnliked){
            throw new ApiError(400, "Inavlid tweetId")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "tweet like removed successfully")
        )
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    // TODO: get all liked videos

    // get userId from req->user
    const userId = req.user?._id
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
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
                                }
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
                ]
            }
        },
        {
            $addFields: {
                videoSize: { $size: "$video" }
            }
        },
        {
            $match: {
                videoSize: { $gte: 1 }
            }
        },
        {
            $project: {
                video: 1
            }
        }
    ])
    if(!likedVideos){
        throw new ApiError(400, "Invalid userId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}