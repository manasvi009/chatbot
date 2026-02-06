# Vercel Deployment Guide for Full-Stack Chatbot Application

## Prerequisites
1. Vercel account (https://vercel.com)
2. MongoDB Atlas account (https://www.mongodb.com/atlas)
3. GitHub account with the repository pushed

## Deployment Steps

### 1. Prepare MongoDB
- Go to MongoDB Atlas
- Create a free cluster
- Create a database user
- Add your IP to whitelist (or allow access from anywhere)
- Get your connection string

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with your GitHub account
3. Click "Add New Project"
4. Import your GitHub repository: `manasvi009/chatbot`
5. Configure the project:
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `build`
   - Install Command: `npm install`

### 3. Set Environment Variables
In Vercel project settings, add these environment variables:
- `NODE_ENV`: `production`
- `VERCEL`: `1`
- `MONGODB_URI`: Your MongoDB connection string
- `CLIENT_URL`: Your Vercel app URL (available after first deployment)

### 4. Deploy
- Click "Deploy"
- Wait for the build to complete (5-10 minutes)

## Important Notes

### Vercel Limitations
- Vercel doesn't support persistent WebSocket connections
- Socket.IO is configured to use polling instead of WebSocket
- This may affect real-time performance but will work for basic chat functionality

### Alternative Approach
If you need full WebSocket support, consider:
1. Deploy frontend to Vercel
2. Deploy backend to Render/Heroku with WebSocket support
3. Configure CORS to allow cross-origin requests

## Troubleshooting

### Build Failures
- Ensure all dependencies are in package.json
- Check that build command is correct
- Verify MongoDB connection string format

### Runtime Errors
- Check environment variables are set correctly
- Verify MongoDB connection
- Check Vercel logs for detailed error messages

### API Route Issues
- All API routes are prefixed with `/api/`
- Make sure frontend API calls use the correct base URL