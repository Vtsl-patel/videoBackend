import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    // get userId(i.e. channelId) from req->user
    const userId = req.user?._id

    // get likes for each videos of channel 
    const likes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $addFields: {
                videoSize: { $size: "$video" },
                video: {
                    $first: "$video"
                }
            }
        },
        {
            $match: {
                "video.owner": userId,
                videoSize: { $gte: 1 }
            }
        },
        {
            $group: {
                _id: "$video._id",
                videoLikes: {
                    $sum: 1
                }
            }
        }
    ])
    if(!likes){
        throw new ApiError(400, "Invalid userId")
    }

    // add this likes to videoStats
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $lookup: {
                from: "likes",
                let: { videoId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$video", "$$videoId"] }
                        }
                    },
                    {
                        $group: {
                            _id: "$video",
                            videoLikes: { $sum: 1 }
                        }
                    }
                ],
                as: "tempLikes"
            }
        },
        {
            $addFields: {
                likes: {
                    $cond: {
                        if: { $gt: [{ $size: "$tempLikes" }, 0] },
                        then: { $arrayElemAt: ["$tempLikes.videoLikes", 0] },
                        else: 0
                    }
                }
            }
        },
        {
            $project: {
                tempLikes: 0 
            }
        }
    ])
    if(!videoStats){
        throw new ApiError(400, "Invalid userId")
    }

    // get total views, total likes, and total videos
    const totalArray = await Video.aggregate([
        {
            $match: {
                owner: userId
            }
        },
        {
            $lookup: {
                from: "likes",
                let: { videoId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$video", "$$videoId"] }
                        }
                    },
                    {
                        $group: {
                            _id: "$video",
                            videoLikes: { $sum: 1 }
                        }
                    }
                ],
                as: "likes"
            }
        },
        {
            $addFields: {
                videoLikes: {
                    $cond: {
                        if: { $gt: [{ $size: "$likes" }, 0] },
                        then: { $arrayElemAt: ["$likes.videoLikes", 0] },
                        else: 0
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$videoLikes" },
                totalVideos: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                totalViews: 1,
                totalLikes: 1,
                totalVideos: 1
            }
        }
    ])
    if(!totalArray){
        throw new ApiError(400, "Invalid userId")
    }

    // get total subscribers
    const subscribersArray = await Subscription.aggregate([
        {
            $match: {
                channel: userId
            }
        },
        {
            $group: {
                _id: null,
                totalSubscribers: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalSubscribers: 1
            }
        }
    ]);
    
    const totals = totalArray[0]
    const subscribers = subscribersArray[0]?.totalSubscribers || { totalSubscribers: 0 };

    const statistics = {
        videoStats,
        totalViews: totals?.totalViews || 0,
        totalLikes: totals?.totalLikes || 0,
        totalSubscribers: subscribers[0]?.totalSubscribers || 0,
        totalVideos: totals?.totalVideos || 0,
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, statistics, "testing")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    // get userId from req->user
    const userId = req.user?._id
    
    // get videos from db
    let videos;
    try {
        videos = Video.aggregate([
            {
                $match: {
                    owner: userId
                }
            }
        ])
    } catch (error) {
        throw new ApiError(500, errmsg || "Internal Server error : Try again later")
    }

    const options = {
        page: 1,
        limit: 10,
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",
        },
    }

    // aggregate pagination on created aggregate pipeline object
    Video.aggregatePaginate(videos, options)
    .then(result => {
        return res
        .status(200)
        .json(
            new ApiResponse(200, result, "video fetched successfully")
        )
    }).catch(error => {
        console.log("error ::", error)
        throw new ApiError(500, error?.message || "Internal server error in video aggregate Paginate")
    })
})

export {
    getChannelStats, 
    getChannelVideos
    }