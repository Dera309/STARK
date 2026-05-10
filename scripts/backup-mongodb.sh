#!/bin/bash

# MongoDB Backup Script for STARK Application
# This script creates automated backups of MongoDB database

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups/mongodb}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="stark_backup_${TIMESTAMP}"

# MongoDB connection (from environment or default)
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/stark}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting MongoDB backup: $BACKUP_NAME"

# Perform backup using mongodump
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$BACKUP_NAME"

# Compress the backup
echo "[$(date)] Compressing backup..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR/$BACKUP_NAME"

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" | cut -f1)
echo "[$(date)] Backup completed: ${BACKUP_NAME}.tar.gz (${BACKUP_SIZE})"

# Clean up old backups (keep only last RETENTION_DAYS days)
echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "stark_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# List remaining backups
echo "[$(date)] Current backups:"
ls -lh "$BACKUP_DIR"/stark_backup_*.tar.gz 2>/dev/null || echo "No backups found"

echo "[$(date)] Backup process completed successfully"
