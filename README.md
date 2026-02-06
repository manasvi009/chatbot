# Chatbot Application - Deployment Guide

## Render Deployment Instructions

### Prerequisites
1. MongoDB Atlas account (free tier available)
2. Render.com account

### Steps to Deploy:

1. **Prepare MongoDB:**
   - Go to MongoDB Atlas (https://www.mongodb.com/atlas)
   - Create a free cluster
   - Create a database user
   - Add your IP to whitelist (or allow access from anywhere for development)
   - Get your connection string

2. **Deploy to Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select `manasvi009/chatbot` repository
   - Configure:
     - Name: `chatbot` (or your preferred name)
     - Environment: `Node.js`
     - Branch: `main`
     - Build Command: `npm install && cd server && npm install && cd .. && npm run build`
     - Start Command: `npm start`
     - Plan: Free

3. **Set Environment Variables in Render:**
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB connection string
   - `CLIENT_URL`: Your Render app URL (available after deployment)
   - `PORT`: `10000`

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for build and deployment (5-10 minutes)

### Common Issues and Solutions:

1. **Build Failures:**
   - Ensure all dependencies are in package.json
   - Check that build command is correct

2. **Runtime Errors:**
   - Verify MongoDB connection string
   - Check environment variables are set correctly
   - Ensure PORT is configured properly

3. **WebSocket Issues:**
   - Socket.IO should work with Render's infrastructure
   - Make sure CORS is properly configured

### Local Development:
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start development server
npm run dev
```

### Production Commands:
```bash
# Build React app
npm run build

# Start production server
npm start
```