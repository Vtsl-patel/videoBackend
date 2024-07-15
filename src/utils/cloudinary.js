import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

const deleteFromCloudinary = async (publicUrl, resource = 'image') => {
    try {
        // Ensure publicUrl is a string
        if (typeof publicUrl !== 'string') {
          throw new TypeError('Expected a string for publicUrl');
        }
        
        const urlParts = publicUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1]; 
        const publicId = publicIdWithExtension.split('.')[0]; 
    
        // Delete the file using the public ID
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resource});

        return result;
      } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        throw error;
      }
}

export { uploadOnCloudinary, deleteFromCloudinary }
    