
# Backend Learning Project

A Node.js backend application designed as a learning project for building scalable APIs with Express, MongoDB, and other modern backend technologies.

---

## 📂 Project Structure

```
backend-learning-main/
backend-learning-main/
├── .gitignore
├── .prettierignore
├── .prettierrc
├── package.json
├── package-lock.json
├── public/
│   └── temp/            # Temporary uploads (add to .gitignore)
├── src/
│   ├── app.js           # Main Express app configuration
│   ├── index.js         # Entry point
│   ├── constants.js     # Application constants
│   ├── controllers/     
│   │   └── user.controller.js      # Business logic for handling requests
│   ├── db/              # Database connection setup
│   │   └── index.js     # Database connection setup
│   ├── middlewares/     # Custom Express middlewares
│   │   ├── auth.middleware.js    
│   │   └── multer.middleware.js     
│   ├── models/          # Mongoose models (User, Video, Subscription)
│   │   ├── subscription.model.js   # Fixed typo from subscriptiom.model.js
│   │   ├── user.model.js
│   │   └── video.model.js        
│   ├── routes/          # Route definitions
│   │   └── user.routes.js
│   └── utils/           # Helper utilities (ApiError, ApiResponse)
│       ├── ApiError.js
│       ├── ApiResponse.js
│       ├── asyncHandler.js
│       └── cloudinary.js
```

---

## 🚀 Features

- **User Authentication**: JWT-based login and signup.
- **File Uploads**: Managed with Multer and stored in Cloudinary.
- **Cloudinary Integration**: Upload avatars and images during user registration.
- **User Profile Management**: Update all user fields, including profile image.
- **MongoDB Integration**: Mongoose models for database operations.
- **API Response Handling**: Custom response and error classes.
- **Prettier Configured**: Code formatting with `.prettierrc`.
- **Scalable Structure**: Organized by controllers, routes, and models.

---

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB & Mongoose** - NoSQL database and ODM
- **Multer** - File upload middleware
- **Cloudinary** - Cloud image storage
- **JWT** - Authentication
- **Prettier** - Code formatting

---

## 🔧 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/backend-learning-main.git
   cd backend-learning-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables:**  
   Create a `.env` file in the project root with values for:
   ```
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    CORS_ORIGIN=*
    ACCESS_TOKEN_SECRET=your_access_token_secret
    ACCESS_TOKEN_EXPIRY=1d  # Example: 1 day
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    REFRESH_TOKEN_EXPIRY=7d # Example: 7 days
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoints

| Method | Endpoint                 | Description                           |  Authentication Required |
|--------|--------------------------|---------------------------------------|--------------------------|
| POST   | `/api/v1/users/signup`   | Create a new user with avatar upload  |           No             |
| POST   | `/api/v1/users/login`    | Login a user                          |           No             |
| POST   | `/api/v1/users/logout`   | Logout existing user                  |           Yes            |
| POST   | `/api/v1/users/update`   | Update user profile fields and image  |           Yes            |
| GET    | `/api/v1/users/:id`      | Get user details                      |           YEs            |


---

## 🌐 Image Upload & Profile Management

- **Avatar Upload During Signup:**  
  When users register, their avatar image is uploaded to **Cloudinary**, and the Cloudinary URL is saved in the database.

- **Profile Update:**  
  Users can update **all their profile fields** (name, email, etc.) and **upload a new profile image**.

- **Temporary Storage:**  
  Uploaded images are first stored temporarily in `/public/temp/` and then uploaded to Cloudinary.

---

## 🤝 Contributing

Feel free to fork this project, raise issues, and submit PRs to improve functionality.

---

## 📜 License

This project is open-source and available under the **MIT License**.