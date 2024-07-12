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

### User Routes
- `POST /register` - Register a new user
- `POST /login` - Login an existing user
- `POST /logout` - Logout the currently logged-in user
- `POST /refresh-token` - Refresh access token using refresh token
- `POST /change-password` - Change the current user's password
- `GET /current-user` - Get details of the current user
- `PATCH /update-account` - Update account details (full name, email)
- `PATCH /avatar` - Update user avatar
- `PATCH /cover-image` - Update user cover image
- `GET /channel/:username` - Get profile details of a user's channel
- `GET /history` - Get watch history of the current user

### Video Routes
- `GET /videos` - Get all videos
- `POST /videos` - Publish a video (includes video file and thumbnail upload)
- `GET /videos/:videoId` - Get a video by ID
- `DELETE /videos/:videoId` - Delete a video
- `PATCH /videos/:videoId` - Update a video (includes thumbnail upload)
- `PATCH /videos/toggle/publish/:videoId` - Toggle publish status of a video

### Playlist Routes
- `POST /playlists` - Create a playlist
- `GET /playlists/:playlistId` - Get a playlist by ID
- `PATCH /playlists/:playlistId` - Update a playlist
- `DELETE /playlists/:playlistId` - Delete a playlist
- `PATCH /playlists/add/:videoId/:playlistId` - Add a video to a playlist
- `PATCH /playlists/remove/:videoId/:playlistId` - Remove a video from a playlist
- `GET /playlists/user/:userId` - Get playlists of a user

### Subscription Routes
- `GET /subscriptions/c/:channelId` - Get subscribed channels
- `POST /subscriptions/c/:channelId` - Toggle subscription status
- `GET /subscriptions/u/:channelId` - Get subscribers of a user channel

### Likes Routes
- `POST /likes/toggle/v/:videoId` - Toggle like status on a video
- `POST /likes/toggle/c/:commentId` - Toggle like status on a comment
- `POST /likes/toggle/t/:tweetId` - Toggle like status on a tweet
- `GET /likes/videos` - Get liked videos

### Comment Routes
- `GET /comments/:videoId` - Get comments for a video
- `POST /comments/:videoId` - Add a comment to a video
- `DELETE /comments/c/:commentId` - Delete a comment
- `PATCH /comments/c/:commentId` - Update a comment

### Tweet Routes
- `POST /tweets` - Create a tweet
- `GET /tweets/user/:userId` - Get tweets of a user
- `PATCH /tweets/:tweetId` - Update a tweet
- `DELETE /tweets/:tweetId` - Delete a tweet

### Dashboard Routes
- `GET /dashboard/stats` - Get channel statistics
- `GET /dashboard/videos` - Get videos of the channel

## Conclusion

The backend of the YouTube clone is organized into multiple controllers, each managing specific aspects of the application to ensure a seamless user experience. 

- **User Controller**: Handles user authentication, profile management, and avatar/cover image updates. It leverages robust libraries and services such as JWT for token management, bcrypt for password hashing, Cloudinary for image management, and MongoDB for data storage.
- **Comment Controller**: Manages commenting functionality, allowing users to add, update, and delete comments on videos.
- **Dashboard Controller**: Provides endpoints for retrieving channel statistics and videos, helping users manage their content and understand their audience.
- **Likes Controller**: Facilitates toggling of like status on videos, comments, and tweets, and retrieving liked videos, enhancing user interaction.
- **Playlist Controller**: Allows users to create, update, and delete playlists, and manage videos within playlists, offering a personalized viewing experience.
- **Subscription Controller**: Manages channel subscriptions, enabling users to subscribe to channels and retrieve their subscribed channels and subscribers.
- **Tweet Controller**: Provides endpoints for creating, updating, and deleting tweets, supporting additional user interaction.
- **Video Controller**: Handles video publishing, retrieval, updating, and deletion, including managing video files and thumbnails.

Each controller is designed to ensure data integrity, security, and efficient user interaction. This modular approach makes the backend robust, scalable, and maintainable, capable of supporting a YouTube-like platform effectively.

## Contribution
Contributions are welcome! If you find any bugs or want to suggest enhancements, please open an issue or submit a pull request.

## License
This project is licensed under nothing, lol feel free to use it for educational purposes

---