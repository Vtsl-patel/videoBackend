import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    // TODO: create playlist
    
    // get title and description from req->body and userId from req->user
    const userId = req.user?._id
    const {name, description} = req.body
    if([name, description].some((field) => field.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    // create playlist
    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })

    // check for created playlist
    const createdPlaylist = await Playlist.findById(playlist._id)
    if(!createdPlaylist){
        throw new ApiError(400, "Error ! Playlist not created")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createdPlaylist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    // TODO: get user playlists
    
    // get userId from req->params
    const {userId} = req.params

    // get playlists from db using userId
    const playlists = await Playlist.aggregate([
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

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlists, "Playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    // TODO: get playlist by id
    
    // get playlistId from req->params
    const { playlistId } = req.params
    if(!playlistId.trim()){
        throw new ApiError(400, "Invalid playlistId")
    }

    // get playlist from db using playlistId
    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
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
        }
    ])
    if(!playlist){
        throw new ApiError(400, "Invalid playlistId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // TODO: add video to playlist

    // get playlistId and videoId from req->params
    const {playlistId, videoId} = req.params
    if(!playlistId.trim() || !videoId.trim()){
        throw new ApiError(400, "Invalid playlistId or videoId")
    }

    // update playlist in db
    const playlist = await Playlist.findByIdAndUpdate(
        new mongoose.Types.ObjectId(playlistId),
        {
            $push: {
                videos: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new: true
        }
    )
    if(!playlist){
        throw new ApiError(400, "Invalid playlistId or videoId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    
    // get playlistId and videoId from req->params
    const {playlistId, videoId} = req.params
    if(!playlistId.trim() || !videoId.trim()){
        throw new ApiError(400, "Invalid playlistId or videoId")
    }

    // update playlist in db
    const playlist = await Playlist.findByIdAndUpdate(
        new mongoose.Types.ObjectId(playlistId),
        {
            $pull: {
                videos: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new: true
        }
    )
    if(!playlist){
        throw new ApiError(400, "Invalid playlistId or videoId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    
    // get playlistId from req->params
    const {playlistId} = req.params
    if(!playlistId.trim()){
        throw new ApiError(400, "Invalid playlistId")
    }

    // delete playlist from db
    const playlist  = await Playlist.findByIdAndDelete(new mongoose.Types.ObjectId(playlistId))
    if(!playlist){
        throw new ApiError(400, "Invalid playlistId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    // TODO: update playlist
    
    // get playlistId from req->params and name, description from req->body
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!playlistId.trim()){
        throw new ApiError(400, "Invalid playlistId")
    }
    if([name, description].some((field) => field.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    // find and update playlist in db
    const playlist = await Playlist.findByIdAndUpdate(
        new mongoose.Types.ObjectId(playlistId),
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    )
    if(!playlist){
        throw new ApiError(400, "Invalid playlistId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}