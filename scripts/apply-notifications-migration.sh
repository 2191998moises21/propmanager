#!/bin/bash

# ========================================
# Apply Notifications Table Migration
# ========================================

set -e  # Exit on error

echo "========================================="
echo "Applying Notifications Table Migration"
echo "========================================="
echo ""

# Variables
PROJECT_ID="propmanager-production-478716"
INSTANCE_NAME="propmanager-db"
DATABASE_NAME="propmanager"
DB_USER="propmanager-user"
MIGRATION_FILE="backend/migrations/add_notifications_table.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📋 Migration Details:"
echo "   Project: $PROJECT_ID"
echo "   Instance: $INSTANCE_NAME"
echo "   Database: $DATABASE_NAME"
echo "   User: $DB_USER"
echo "   Migration: $MIGRATION_FILE"
echo ""

# Confirm before proceeding
read -p "⚠️  This will create the notifications table. Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 1
fi

echo ""
echo "🔄 Connecting to Cloud SQL and applying migration..."
echo ""

# Apply migration
gcloud sql connect "$INSTANCE_NAME" \
    --user="$DB_USER" \
    --database="$DATABASE_NAME" \
    --project="$PROJECT_ID" \
    < "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "📊 Verifying table creation..."
    echo "SELECT 'notifications' as table_name, COUNT(*) as record_count FROM notifications;" | \
        gcloud sql connect "$INSTANCE_NAME" \
            --user="$DB_USER" \
            --database="$DATABASE_NAME" \
            --project="$PROJECT_ID"
    echo ""
    echo "🎉 Notifications table is ready!"
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi
