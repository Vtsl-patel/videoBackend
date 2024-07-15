import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination

    // get paramaters from req->query
    const { page = 1, limit = 10, query = "", sortBy = "views", sortType = 1, userId } = req.query

    const matchParams = {
        $or: [
            { title: {$regex: query, $options: 'i'} },
            { description: {$regex: query, $options: 'i'} }
        ]
    }
    if(userId){
        matchParams.owner = new mongoose.Types.ObjectId(userId)
    }

    // aggregation pipeline for the same
    // NOTE: we can't use await here because we want the object of aggregate and not the populated data, as aggregatePaginate
    // accepts object of aggregation pipeline
    let videoAggregate
    try {
        videoAggregate = Video.aggregate([
            {
                $match: matchParams
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
                        }
                    ]
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner",
                    },
                },
            },
            {
                $sort: {
                    [sortBy || "createdAt"]: parseInt(sortType) || 1
                }
            },
        ])
    } catch (error) {
        throw new ApiError(500, error.message || "Internal server error in video aggregation");
    }

    const options = {
        page,
        limit,
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",
        },
        skip: (page - 1) * limit,
        limit: parseInt(limit),
    }

    // aggregate pagination on created aggregate pipeline object
    Video.aggregatePaginate(videoAggregate, options)
    .then(result => {
        if (result?.videos?.length === 0 && userId) {
            return res.status(200).json(new ApiResponse(200, [], "No videos found"))
        }

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

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video

    // get title and description from req->body
    const { title, description} = req.body
    if([title, description].some((field) => field.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    // get video owner from req->user
    const user = req.user?._id

    // check for videoFile and thumbnail
    let videoFileLocalPath
    if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0){
        videoFileLocalPath = req.files.videoFile[0].path;
    }

    let thumbnailLocalPath
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    if(!videoFileLocalPath || !thumbnailLocalPath){
        throw new ApiError(400, "All fields are required")
    } 

    // upload videoFile and thumbnail to cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile || !thumbnail){
        throw new ApiError(400, "All fields are required");
    }

    // create video document
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: user
    })

    // check for video creation
    const createdVideo = await Video.findById(video._id);
    if(!createdVideo){
        throw new ApiError(400, "Internal Server Error during video uploading : Try again later")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createdVideo, "Video uploaded successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    // TODO: get video by id
    
    // get videoId from req->params and userId from req->user
    const userId = req.user?._id
    const { videoId } = req.params
    if(!videoId.trim()){
        throw new ApiError(400, "Video doesn't exist")
    }

    // get video from database using videoId
    const video = await Video.findByIdAndUpdate(
        new mongoose.Types.ObjectId(videoId),
        {
            $inc: {
                views: 1
            }
        },
        {
            new: true
        }
    )
    if(!video){
        throw new ApiError(400, "Video doesn't exist")
    }

    // push video to user WatchHistory
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $push: {
                watchHistory: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new: true
        }
    )
    if(!user){
        throw new ApiError(500, "Internal Server error try again later")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    // TODO: update video details like title, description, thumbnail
    
    // get videoId from req->params and title, description from req->body
    const { videoId } = req.params
    const { title, description } = req.body
    if(!videoId.trim()){
        throw new ApiError(400, "Video doesn't exist")
    }
    if([title, description].some((field) => field.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    // get old thumbnail url from db
    const oldVideo = await Video.findById(videoId).select("thumbnail")
    const oldThumbnail = oldVideo.thumbnail
    const resultThumbnail = deleteFromCloudinary(oldThumbnail)
    if(!resultThumbnail){
        throw new ApiError(500, "Internal Server error (Cloudinary) : try again")
    }

    // get updated thumbnail
    let thumbnailLocalPath = req.file?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400, "All fields are required")
    }

    // upload video to cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail){
        throw new ApiError(400, "All fields are required");
    }

    // update video details
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url,
            }
        },
        {
            new: true
        }
    )
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video Details updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    // TODO: delete video

    // get videoId from req->params and userId from req->user
    const userId = req.user?._id
    const { videoId } = req.params

    // get video owner from db
    const videoOwner = await Video.findById(videoId)

    if(videoOwner.owner.toString() !== userId.toString()){
        throw new ApiError(400, "You are not authorised to delete the")
    }
    
    // delete video file from db
    const video = await Video.findByIdAndDelete(videoId) 
    
    if(!video){
        throw new ApiError(400, "Video doesn't exist")
    }
    
    // get videoFile and thumbnail url and delete from cloudinary
    const videoFile = video.videoFile
    const thumbnail = video.thumbnail

    const resultVideoFile = deleteFromCloudinary(videoFile, 'video')
    const resultThumbnail = deleteFromCloudinary(thumbnail)

    if(!resultVideoFile || !resultThumbnail){
        throw new ApiError(500, "Internal Server error (Cloudinary) : try again")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    // get videoId from req->params
    const { videoId } = req.params
    if(!videoId.trim()){
        throw new ApiError(400, "Video doesn't exist")
    }

    const originalVideoStatus = await Video.findById(videoId)
    if(!originalVideoStatus){
        throw new ApiError(400, "Video doesn't exist")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !originalVideoStatus.isPublished
            }
        },
        {
            new: true
        }
    )
    if(!video){
        throw new ApiError(400, "Video doesn't exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video status toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}