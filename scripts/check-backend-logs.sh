#!/bin/bash

# ========================================
# Check Backend Logs for Errors
# ========================================

echo "========================================="
echo "Checking Backend Logs (last 50 entries)"
echo "========================================="
echo ""

gcloud run services logs read propmanager-backend \
    --project=propmanager-production-478716 \
    --region=us-central1 \
    --limit=50 \
    --format="table(timestamp,severity,textPayload)"

echo ""
echo "========================================="
echo "Filtering for ERROR entries only"
echo "========================================="
echo ""

gcloud run services logs read propmanager-backend \
    --project=propmanager-production-478716 \
    --region=us-central1 \
    --limit=100 \
    | grep -i "error\|500" | head -30
