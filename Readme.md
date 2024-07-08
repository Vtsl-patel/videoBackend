# YouTube Clone Backend

## Description
This project serves as the backend for a YouTube clone application. It provides APIs for user authentication, video management, user profiles, subscriptions, and more.

## Technologies Used
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework for Node.js
- **MongoDB**: NoSQL database for storing application data
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js
- **JWT (JSON Web Tokens)**: For user authentication and authorization
- **bcrypt**: Library for hashing passwords
- **Cloudinary**: Cloud-based image and video management platform
- **Multer**: Middleware for handling file uploads in Node.js
- **dotenv**: Module for loading environment variables from a .env file
- **cors**: Middleware for enabling CORS (Cross-Origin Resource Sharing)
- **cookie-parser**: Middleware for parsing cookies in Express

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Vtsl-patel/youtubeBackend.git
   cd youtubeBackend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/youtube_clone
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints
- **POST /register**: Register a new user.
- **POST /login**: Login an existing user.
- **POST /logout**: Logout the currently logged-in user.
- **POST /refresh-token**: Refresh access token using refresh token.
- **POST /change-password**: Change the current user's password.
- **GET /current-user**: Get details of the current user.
- **PATCH /update-account**: Update account details (full name, email).
- **PATCH /avatar**: Update user avatar.
- **PATCH /cover-image**: Update user cover image.
- **GET /channel/:username**: Get profile details of a user's channel.
- **GET /history**: Get watch history of the current user.

Certainly! Here's an overview of how the user controller in this project works:

## User Controller Overview

1. **Registration (`registerUser`)**:
   - Handles the registration process when a new user signs up.
   - Validates incoming user data such as full name, username, email, and password.
   - Checks if the username or email already exists in the database to prevent duplicates.
   - Handles file uploads for user avatar and cover image using **Multer** middleware.
   - Utilizes **Cloudinary** to upload these images to the cloud.
   - Creates a new user object in the database with hashed passwords and uploaded image URLs.
   - Returns a response indicating successful registration or appropriate error messages.

2. **Login (`loginUser`)**:
   - Manages the login process when an existing user attempts to log in.
   - Validates the user's credentials (username/email and password).
   - If credentials are valid, generates both access and refresh tokens for the user.
   - Stores the refresh token in the database for later use.
   - Sends the access token as an HTTP-only cookie to the client for authentication.
   - Returns a response containing the logged-in user's details along with tokens.

3. **Logout (`logoutUser`)**:
   - Handles the logout functionality when a user decides to log out.
   - Clears the refresh token from the database associated with the user.
   - Clears both access and refresh tokens from the client-side cookies.
   - Returns a response confirming successful logout.

4. **Token Refresh (`refreshAccessToken`)**:
   - Facilitates the token refresh process using the refresh token.
   - Validates the incoming refresh token and retrieves the user associated with it.
   - Generates new access and refresh tokens if the refresh token is valid and matches the stored token.
   - Sends the new access token as a replacement cookie after clearing the old ones.
   - Returns a response with the refreshed access token or appropriate error messages.

5. **Password Change (`changeCurrentPassword`)**:
   - Manages the process for changing a user's current password.
   - Validates the old password provided by the user.
   - If valid, updates the password with the new one provided.
   - Returns a response indicating successful password change or errors if the old password is incorrect.

6. **Current User Details (`getCurrentUser`)**:
   - Retrieves and returns details of the currently logged-in user.
   - Excludes sensitive information like passwords and refresh tokens from the response.
   - Returns a response with the current user's details.

7. **Update Account Details (`updateAccountDetails`)**:
   - Handles updating a user's account details such as full name and email.
   - Validates incoming data to ensure all required fields are provided.
   - Updates the user's details in the database.
   - Returns a response confirming successful update with the updated user details.

8. **Update User Avatar (`updateUserAvatar`)** and **Update User Cover Image (`updateUserCoverImage`)**:
   - Manages the process of updating a user's avatar or cover image.
   - Handles file uploads using Multer middleware.
   - Utilizes Cloudinary to upload the images to the cloud and update the URLs in the user's profile.
   - Returns a response confirming successful image update with the updated user details.

9. **Get User Channel Profile (`getUserChannelProfile`)**:
   - Retrieves and returns the profile details of a user's channel based on the provided username.
   - Utilizes MongoDB aggregation pipelines to fetch additional details such as subscriber count and subscription status.
   - Returns a response with the fetched channel details.

10. **Get Watch History (`getWatchHistory`)**:
    - Retrieves and returns the watch history of the currently logged-in user.
    - Uses MongoDB aggregation to populate video details in the watch history.
    - Returns a response with the user's watch history.

## Conclusion
The user controller manages various aspects of user authentication, profile management, and content interaction within the YouTube clone backend. It utilizes robust libraries and services like JWT for token management, bcrypt for password hashing, Cloudinary for image management, and MongoDB for data storage. Each function ensures data integrity, security, and efficient user interaction, making the backend robust and scalable for a YouTube-like platform.

## Contribution
Contributions are welcome! If you find any bugs or want to suggest enhancements, please open an issue or submit a pull request.

## License
This project is licensed under nothing, lol feel free to use it for educational purposes

### PROJECT IS STILL UNDER DEVELOPMENT PHASE WILL BE COMPLETED SOON

---