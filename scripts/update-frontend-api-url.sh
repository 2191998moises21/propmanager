#!/bin/bash

# ========================================
# Update Frontend with Backend API URL
# Automatically detects backend URL and updates frontend configuration
# ========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="propmanager-production-478716"
REGION="us-central1"
BACKEND_SERVICE="propmanager-backend"
FRONTEND_CONFIG="cloudbuild.yaml"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Frontend API URL Update Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Get backend URL
echo -e "${YELLOW}→ Step 1: Getting backend URL...${NC}"

BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
  --project=$PROJECT_ID \
  --region=$REGION \
  --format='value(status.url)' 2>&1)

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Error: Could not get backend URL${NC}"
  echo -e "${YELLOW}  Make sure the backend is deployed first:${NC}"
  echo -e "  ${BLUE}cd backend && gcloud builds submit --config=cloudbuild.yaml${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Backend URL: $BACKEND_URL${NC}"

# Construct API URL
API_URL="${BACKEND_URL}/api/v1"
echo -e "${GREEN}✓ API URL: $API_URL${NC}"
echo ""

# Step 2: Update cloudbuild.yaml
echo -e "${YELLOW}→ Step 2: Updating $FRONTEND_CONFIG...${NC}"

# Backup original file
cp $FRONTEND_CONFIG ${FRONTEND_CONFIG}.backup
echo -e "${GREEN}✓ Backup created: ${FRONTEND_CONFIG}.backup${NC}"

# Update the _API_URL substitution
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS (BSD sed)
  sed -i '' "s|_API_URL:.*|_API_URL: '$API_URL'|" $FRONTEND_CONFIG
else
  # Linux (GNU sed)
  sed -i "s|_API_URL:.*|_API_URL: '$API_URL'|" $FRONTEND_CONFIG
fi

echo -e "${GREEN}✓ Updated _API_URL in $FRONTEND_CONFIG${NC}"
echo ""

# Step 3: Show diff
echo -e "${YELLOW}→ Step 3: Changes made:${NC}"
echo -e "${BLUE}Old:${NC} _API_URL: 'https://propmanager-backend-REPLACE_WITH_ACTUAL_HASH-uc.a.run.app/api/v1'"
echo -e "${GREEN}New:${NC} _API_URL: '$API_URL'"
echo ""

# Step 4: Ask for confirmation
echo -e "${YELLOW}Do you want to deploy the frontend with this configuration? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo ""
  echo -e "${YELLOW}→ Step 4: Deploying frontend...${NC}"

  gcloud builds submit \
    --config=$FRONTEND_CONFIG \
    --project=$PROJECT_ID

  echo ""
  echo -e "${GREEN}✓ Frontend deployment started!${NC}"
  echo ""

  # Step 5: Get frontend URL
  echo -e "${YELLOW}→ Step 5: Getting frontend URL...${NC}"
  sleep 5  # Wait for deployment to register

  FRONTEND_URL=$(gcloud run services describe propmanager-frontend \
    --project=$PROJECT_ID \
    --region=$REGION \
    --format='value(status.url)' 2>/dev/null)

  if [ -n "$FRONTEND_URL" ]; then
    echo -e "${GREEN}✓ Frontend URL: $FRONTEND_URL${NC}"
    echo ""

    # Step 6: Update backend CORS
    echo -e "${YELLOW}→ Step 6: Updating backend CORS...${NC}"
    echo -e "${YELLOW}  This allows the frontend to make API calls${NC}"

    gcloud run services update $BACKEND_SERVICE \
      --project=$PROJECT_ID \
      --region=$REGION \
      --update-env-vars CORS_ORIGIN="$FRONTEND_URL" \
      --quiet

    echo -e "${GREEN}✓ Backend CORS updated${NC}"
    echo ""
  fi

  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✓ Setup Complete!${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo -e "${BLUE}Next steps:${NC}"
  echo -e "1. Open frontend: ${GREEN}$FRONTEND_URL${NC}"
  echo -e "2. Open DevTools (F12) and check console"
  echo -e "3. Try logging in/registering"
  echo ""
  echo -e "${BLUE}Verify API URL in browser console:${NC}"
  echo -e "  ${YELLOW}console.log(import.meta.env.VITE_API_URL)${NC}"
  echo -e "  ${GREEN}Should show: $API_URL${NC}"
  echo ""

else
  echo ""
  echo -e "${YELLOW}Deployment cancelled.${NC}"
  echo -e "${BLUE}To deploy manually later, run:${NC}"
  echo -e "  ${YELLOW}gcloud builds submit --config=$FRONTEND_CONFIG --project=$PROJECT_ID${NC}"
  echo ""
  echo -e "${BLUE}To restore backup:${NC}"
  echo -e "  ${YELLOW}mv ${FRONTEND_CONFIG}.backup $FRONTEND_CONFIG${NC}"
  echo ""
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Script Complete${NC}"
echo -e "${BLUE}========================================${NC}"
