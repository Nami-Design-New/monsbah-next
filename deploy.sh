#!/bin/bash

# Deployment script for Monsbah Next.js application
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Configuration - UPDATE THESE VALUES
SERVER_USER="your-username"
SERVER_HOST="your-server-ip"
SERVER_PATH="/var/www/monsbah"
PM2_APP_NAME="monsbah"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build locally
echo -e "${YELLOW}📦 Building application locally...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Step 2: Create deployment package
echo -e "${YELLOW}📋 Creating deployment package...${NC}"
tar -czf monsbah-deploy.tar.gz \
    .next \
    public \
    package.json \
    package-lock.json \
    next.config.mjs \
    ecosystem.config.js \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env.local'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Package created${NC}"
else
    echo -e "${RED}❌ Package creation failed${NC}"
    exit 1
fi

# Step 3: Upload to server
echo -e "${YELLOW}📤 Uploading to server...${NC}"
scp monsbah-deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Upload successful${NC}"
else
    echo -e "${RED}❌ Upload failed${NC}"
    exit 1
fi

# Step 4: Deploy on server
echo -e "${YELLOW}🔧 Deploying on server...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
    set -e
    
    echo "Extracting files..."
    cd /tmp
    tar -xzf monsbah-deploy.tar.gz -C ${SERVER_PATH}
    
    echo "Installing dependencies..."
    cd ${SERVER_PATH}
    npm ci --omit=dev
    
    echo "Setting permissions..."
    sudo chown -R www-data:www-data ${SERVER_PATH}
    sudo chmod -R 755 ${SERVER_PATH}
    
    echo "Restarting PM2 application..."
    pm2 restart ${PM2_APP_NAME} || pm2 start ecosystem.config.js
    pm2 save
    
    echo "Cleaning up..."
    rm /tmp/monsbah-deploy.tar.gz
    
    echo "Deployment complete!"
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Step 5: Clean up local package
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm monsbah-deploy.tar.gz

# Step 6: Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "pm2 status ${PM2_APP_NAME}"

echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your site should now be live at: https://monsbah.com${NC}"
