#!/bin/bash

# ========================================
# Manual Backend Deployment Script
# ========================================
# Use this script to manually trigger a backend deployment
# when Cloud Build triggers aren't working or need immediate deployment

set -e  # Exit on error

PROJECT_ID="propmanager-production-478716"
REGION="us-central1"

echo "========================================="
echo "Manual Backend Deployment"
echo "========================================="
echo ""
echo "📋 Configuration:"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo "   Build Config: backend/cloudbuild-manual.yaml"
echo ""

# Confirm current directory
if [ ! -f "backend/cloudbuild-manual.yaml" ]; then
    echo "❌ Error: Must run this script from the repository root"
    echo "   Current directory: $(pwd)"
    echo "   Expected file: backend/cloudbuild-manual.yaml"
    exit 1
fi

echo "✅ Repository root confirmed"
echo ""

# Get current commit SHA
COMMIT_SHA=$(git rev-parse --short HEAD)
echo "📝 Current commit: $COMMIT_SHA"
echo ""

# Confirm before proceeding
read -p "🚀 Ready to deploy backend to Cloud Run? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔄 Submitting build to Cloud Build..."
echo ""
echo "ℹ️  Note: Submitting from backend/ directory to avoid .gcloudignore conflicts"
echo ""

# Change to backend directory and submit build
# This avoids the root .gcloudignore which excludes backend/
cd backend
gcloud builds submit \
    --config=cloudbuild-manual.yaml \
    --project=$PROJECT_ID \
    --substitutions=_COMMIT_SHA="$COMMIT_SHA" \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build submitted successfully!"
    echo ""
    echo "📊 Monitoring build status..."
    echo "   View in console: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
    echo ""
    echo "⏳ Waiting 30 seconds for build to start..."
    sleep 30
    echo ""
    echo "📋 Recent builds:"
    gcloud builds list --limit=3 --project=$PROJECT_ID
    echo ""
    echo "🎉 Deployment initiated! Check the console for build progress."
else
    echo ""
    echo "❌ Build submission failed. Check the error messages above."
    exit 1
fi
