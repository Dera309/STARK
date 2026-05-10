#!/bin/bash

# MongoDB Restore Script for STARK Application
# This script restores a MongoDB database from a backup

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups/mongodb}"
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/stark}"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/stark_backup_*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "[$(date)] Starting MongoDB restore from: $BACKUP_FILE"

# Extract backup
TEMP_DIR=$(mktemp -d)
echo "[$(date)] Extracting backup to temporary directory..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find the extracted backup directory
BACKUP_NAME=$(ls "$TEMP_DIR" | head -n 1)
BACKUP_PATH="$TEMP_DIR/$BACKUP_NAME"

# Restore using mongorestore
echo "[$(date)] Restoring database..."
mongorestore --uri="$MONGODB_URI" --drop "$BACKUP_PATH"

# Clean up
rm -rf "$TEMP_DIR"

echo "[$(date)] Database restore completed successfully"
