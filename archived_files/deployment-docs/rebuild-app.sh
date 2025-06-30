#!/bin/bash

# Rebuild and restart AfiliadosBet application

echo "🔧 Rebuilding application completely..."

cd /var/www/afiliadosbet

# Stop and remove PM2 process
pm2 stop afiliadosbet 2>/dev/null || true
pm2 delete afiliadosbet 2>/dev/null || true

# Clean build directory
rm -rf dist/ node_modules/.cache

# Install dependencies fresh
npm cache clean --force
npm install

# Check if package.json has the correct scripts
echo "Checking build scripts..."
grep -A 5 -B 5 '"scripts"' package.json

# Try building with different methods
echo "Building application..."

# Method 1: Standard build
if npm run build; then
    echo "✅ Standard build successful"
else
    echo "❌ Standard build failed, trying alternative method..."
    
    # Method 2: Manual build
    rm -rf dist/
    mkdir -p dist/public
    
    # Build frontend
    cd client
    npx vite build --outDir ../dist/public
    cd ..
    
    # Build backend
    npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm --external:pg-native
fi

# Check if build was successful
if [ -f "dist/index.js" ]; then
    echo "✅ Build files created successfully"
    ls -la dist/
else
    echo "❌ Build failed, trying direct TypeScript compilation..."
    npx tsc --project tsconfig.json --outDir dist
fi

# Set environment variables
export NODE_ENV=production
export PORT=5000
export DATABASE_URL="postgresql://afiliadosbet:Alepoker@800@localhost:5432/afiliadosbet"

# Test if we can run the application directly
echo "Testing application startup..."
cd dist
timeout 10s node index.js &
APP_PID=$!
sleep 5

# Check if port is now open
if netstat -tln | grep ':5000'; then
    echo "✅ Application is listening on port 5000"
    kill $APP_PID 2>/dev/null
else
    echo "❌ Application not listening, checking for errors..."
    kill $APP_PID 2>/dev/null
    # Try with more verbose output
    timeout 5s node index.js
fi

# Start with PM2
echo "Starting with PM2..."
pm2 start index.js --name afiliadosbet --env production

# Wait and test
sleep 5
pm2 logs afiliadosbet --lines 20 --nostream

echo "Final test..."
curl -v http://localhost:5000 2>&1 | head -10

echo "Status:"
pm2 status
netstat -tln | grep ':5000'