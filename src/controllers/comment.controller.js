import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    // TODO: get all comments for a video

    // get videoId from req->params and queries from req->query
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    if(!videoId.trim()){
        throw new ApiError(400, "Invalid videoId")
    }

    // write aggregation pipeline for comments of a video
    let comments
    try {
        comments = Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
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
        ])
    } catch (error) {
        throw new ApiError(400, errmsg || "Invalid videoId")
    }

    const options = {
        page,
        limit,
        customLabels: {
            totalDocs: "totalComments",
            docs: "comments",
        },
        skip: (page - 1) * limit,
        limit: parseInt(limit),
    }

    // aggregate pagination on created aggregate pipeline object
    Comment.aggregatePaginate(comments, options)
    .then(result => {
        return res
        .status(200)
        .json(
            new ApiResponse(200, result, "Comments fetched successfully")
        )
    }).catch(error => {
        throw new ApiError(500, error?.message || "Internal server error in video aggregate Paginate")
    })


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    // get videoId from req->params, content from req->body and userId from req->user
    const userId = req.user?._id
    const { content } = req.body
    const { videoId } = req.params
    if(!videoId.trim() || !content.trim()){
        throw new ApiError(400, "Invalid videoId or empty comment")
    }

    // create comment in db
    const comment = await Comment.create({
        content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: userId
    })
    if(!comment){
        throw new ApiError(400, "Invalid videoId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    // get commentId from req->params and content from req->body
    const { commentId } = req.params
    const { content } = req.body
    if(!commentId.trim() || !content.trim()){
        throw new ApiError(400, "Invalid commentId or empty comment")
    }

    // update comment in db
    const comment = await Comment.findByIdAndUpdate(
        new mongoose.Types.ObjectId(commentId),
        {
            $set: {
                content,
            }
        },
        {
            new: true
        }
    )
    if(!comment){
        throw new ApiError(400, "Invalid commentId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    // get commentId from req->params
    const { commentId } = req.params
    if(!commentId.trim()){
        throw new ApiError(400, "Invalid commentId")
    }

    // delete comment from db
    const comment = await Comment.findByIdAndDelete(new mongoose.Types.ObjectId(commentId))
    if(!commentId){
        throw new ApiError(400, "Invalid commendId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}