#!/bin/bash

# Debug and Fix Application Startup
# Complete diagnostic and repair

echo "🔍 Debugging application startup..."

cd /var/www/afiliadosbet

# 1. Check PM2 logs for errors
echo "=== PM2 LOGS ==="
pm2 logs afiliadosbet --lines 30 --nostream 2>/dev/null || echo "No PM2 logs found"

# 2. Check if build files exist
echo -e "\n=== BUILD FILES ==="
ls -la dist/ 2>/dev/null || echo "No dist directory"
ls -la dist/index.js 2>/dev/null || echo "No index.js file"

# 3. Check environment variables
echo -e "\n=== ENVIRONMENT ==="
cat .env 2>/dev/null || echo "No .env file"

# 4. Test database connection
echo -e "\n=== DATABASE TEST ==="
psql postgresql://afiliadosapp:app123@localhost:5432/afiliadosbet -c "SELECT 1;" 2>/dev/null && echo "✅ Database OK" || echo "❌ Database connection failed"

# 5. Check if port 3000 is in use
echo -e "\n=== PORT CHECK ==="
netstat -tlnp | grep 3000 || echo "Port 3000 is free"

# 6. Test Node.js directly
echo -e "\n=== DIRECT NODE TEST ==="
if [ -f "dist/index.js" ]; then
    cd dist
    echo "Testing Node.js execution..."
    timeout 10s node index.js &
    NODE_PID=$!
    sleep 5
    
    if kill -0 $NODE_PID 2>/dev/null; then
        echo "✅ Node.js process running"
        kill $NODE_PID 2>/dev/null
    else
        echo "❌ Node.js process crashed"
    fi
    cd ..
else
    echo "❌ No index.js file to test"
fi

# 7. Clean rebuild
echo -e "\n=== REBUILDING APPLICATION ==="
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Clean everything
rm -rf dist/ node_modules/.cache/

# Fresh install
npm cache clean --force
npm install

# Configure environment
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliadosapp:app123@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_key_production
DOMAIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000
EOF

# Ensure database exists
sudo -u postgres createdb afiliadosbet 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER afiliadosapp WITH ENCRYPTED PASSWORD 'app123';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosapp;" 2>/dev/null || true

# Build with verbose output
echo "Building application..."
npm run build 2>&1 | tee build.log

# Alternative build if failed
if [ ! -f "dist/index.js" ]; then
    echo "Standard build failed, trying alternative..."
    mkdir -p dist/public
    
    # Build frontend
    cd client
    npx vite build --outDir ../dist/public --mode production
    cd ..
    
    # Build backend with specific configuration
    npx esbuild server/index.ts \
        --bundle \
        --platform=node \
        --target=node20 \
        --outfile=dist/index.js \
        --format=esm \
        --external:pg-native \
        --external:fsevents \
        --sourcemap
fi

# Verify build
if [ -f "dist/index.js" ]; then
    echo "✅ Build file created: $(wc -c < dist/index.js) bytes"
else
    echo "❌ Build failed completely"
    exit 1
fi

# Setup database tables
echo "Setting up database..."
npm run db:push

# Test application before PM2
echo -e "\n=== TESTING BEFORE PM2 ==="
cd dist
echo "Starting Node.js test..."

# Capture any startup errors
node index.js 2>&1 &
NODE_PID=$!
sleep 8

if kill -0 $NODE_PID 2>/dev/null; then
    # Check if listening on port
    if netstat -tln | grep ':3000' >/dev/null; then
        echo "✅ Application listening on port 3000"
        # Test HTTP response
        if curl -f -s http://localhost:3000 >/dev/null; then
            echo "✅ HTTP response OK"
        else
            echo "⚠️ HTTP response failed"
        fi
    else
        echo "❌ Not listening on port 3000"
    fi
    kill $NODE_PID 2>/dev/null
else
    echo "❌ Node.js process crashed during startup"
fi

cd ..

# Start with PM2
echo -e "\n=== STARTING WITH PM2 ==="
pm2 start dist/index.js --name afiliadosbet --env production --log-type json
pm2 save

# Wait for startup
sleep 10

# Final verification
echo -e "\n=== FINAL STATUS ==="
pm2 status
pm2 logs afiliadosbet --lines 10 --nostream

# Test connectivity
if curl -f -s http://localhost:3000 >/dev/null; then
    echo -e "\n✅ APPLICATION RUNNING SUCCESSFULLY"
    
    # Configure Nginx
    cat > /etc/nginx/sites-available/default << 'EOFNGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOFNGINX
    
    nginx -t && systemctl reload nginx
    
    echo "🎉 DEPLOYMENT SUCCESSFUL"
    echo "🌐 Access at: http://$(curl -s ifconfig.me)"
    
else
    echo -e "\n❌ APPLICATION STILL NOT RESPONDING"
    echo "Latest logs:"
    pm2 logs afiliadosbet --lines 20 --nostream
    echo -e "\nDirect test output:"
    cd dist && timeout 5s node index.js 2>&1
fi