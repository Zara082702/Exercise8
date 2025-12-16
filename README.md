# Neighbor Notes

A modern social platform for neighborhood communication built with Next.js, Firebase, and MySQL.

## Features

### 🏘️ Community Posts
- **Create Posts**: Share announcements, events, lost & found items, and services with your neighbors
- **Rich Content**: Add images to your posts for better visual communication
- **Categories**: Organize posts by type (General, Event, Lost & Found, Service, Urgent)
- **Location Tagging**: Add location information to posts

### 💬 Interactive Comments
- **Comment System**: Engage with posts by leaving comments
- **Threaded Discussions**: View all comments on posts with user information
- **Real-time Updates**: Comments appear immediately after posting

### 👥 User Profiles
- **Profile Pages**: View detailed profiles of other community members
- **Profile Customization**: Edit your display name, bio, and profile picture
- **Post History**: See all posts from any user
- **User Statistics**: View post counts and join dates

### 📁 Media Uploads
- **Image Uploads**: Attach images to posts and profile pictures
- **Document Sharing**: Upload PDFs and other documents
- **Firebase Storage**: Secure cloud storage for all media files
- **File Validation**: Size and type restrictions for security

### 🔐 Authentication & Security
- **Firebase Auth**: Secure user authentication
- **User-friendly Errors**: Clear error messages for all operations
- **Input Validation**: Client and server-side validation
- **Database Security**: Proper SQL injection prevention

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop and mobile
- **Tailwind CSS**: Beautiful, consistent styling
- **Loading States**: Smooth user experience with loading indicators
- **Error Handling**: Graceful error handling with user feedback

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: MySQL (via XAMPP)
- **File Storage**: Firebase Storage
- **Icons**: Lucide React

## Getting Started

### Prerequisites

1. **XAMPP**: Install XAMPP for MySQL database
2. **Node.js**: Version 18 or higher
3. **Firebase Project**: Set up a Firebase project with Authentication and Storage enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neighbor-notes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Start XAMPP and ensure MySQL is running
   - Create a database named `neighbornotes`
   - Run the database schema:
     ```bash
     mysql -u root neighbornotes < database_schema.sql
     ```

4. **Configure Firebase**
   - Update the Firebase config in `lib/auth.tsx` and `app/api/upload/route.ts` with your project credentials

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Create an account or log in to start using the platform

## Database Schema

The application uses the following database tables:

- `users`: User profiles and authentication data
- `posts`: Community posts with images and metadata
- `comments`: Comments on posts
- `media_uploads`: File upload tracking

## API Routes

- `GET/POST /api/posts`: Fetch and create posts
- `GET/POST /api/comments`: Fetch and create comments
- `GET/PUT /api/users`: Fetch and update user profiles
- `POST /api/upload`: Upload files to Firebase Storage

## Usage

### Creating Posts
1. Log in to your account
2. Click "Post" on the main page
3. Fill in title, content, category, and optional location
4. Optionally add an image
5. Click "Create Post"

### Adding Comments
1. View any post on the main page
2. Click "Show Comments"
3. Click "Add a comment"
4. Type your comment and press enter

### Viewing Profiles
1. Click on any username in posts or comments
2. View their profile, posts, and information
3. Edit your own profile by clicking "Edit Profile"

### Uploading Media
- **Post Images**: Add images when creating posts
- **Profile Pictures**: Update your profile picture in your profile settings
- **Documents**: Upload PDFs and other files (feature available in profile)

## Error Handling

The application provides user-friendly error messages for:
- Invalid input data
- Authentication failures
- Database connection issues
- File upload problems
- Network errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
