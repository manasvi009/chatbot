@echo off
echo ========================================
echo 🚀 Chatbot Deployment Script
echo ========================================
echo.

echo 1. Building React application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed. Please check for errors.
    pause
    exit /b 1
)
echo ✅ Build successful!
echo.

echo 2. Preparing deployment files...
git add .
git commit -m "Deployment preparation: Build and config updates"
git push origin main
echo ✅ Code pushed to GitHub
echo.

echo 3. Next steps:
echo    - Go to https://vercel.com/dashboard
echo    - Import your repository: manasvi009/chatbot
echo    - Use these settings:
echo        Framework: Other
echo        Build Command: npm run build
echo        Output Directory: build
echo        Install Command: npm install
echo.
echo    - After deployment, add these environment variables:
echo        NODE_ENV = production
echo        VERCEL = 1
echo        MONGODB_URI = your_mongodb_connection_string
echo        JWT_SECRET = your_secure_secret
echo        CLIENT_URL = your_vercel_url
echo.

echo 🎉 Ready for Vercel deployment!
echo Open https://vercel.com/new to deploy your app
pause