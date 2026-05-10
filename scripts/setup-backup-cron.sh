#!/bin/bash

# Database Backup Cron Job Setup Script for STARK Application
# This script sets up automated MongoDB backups using cron

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$BACKUP_SCRIPT_DIR/backup-mongodb.sh"
BACKUP_DIR="${BACKUP_DIR:-/backups/mongodb}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
CRON_HOUR="${CRON_HOUR:-2}"
CRON_MINUTE="${CRON_MINUTE:-0}"

echo "================================"
echo "Database Backup Cron Job Setup"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Note: This script requires sudo privileges to set up cron jobs.${NC}"
  echo "You may be prompted for your password."
  echo ""
fi

# Check if backup script exists
if [ ! -f "$BACKUP_SCRIPT" ]; then
  echo -e "${RED}Error: Backup script not found at $BACKUP_SCRIPT${NC}"
  exit 1
fi

# Make backup script executable
echo "Making backup script executable..."
chmod +x "$BACKUP_SCRIPT"
echo -e "${GREEN}✓${NC} Backup script is now executable"
echo ""

# Create backup directory
echo "Creating backup directory..."
sudo mkdir -p "$BACKUP_DIR"
sudo chown $USER:$USER "$BACKUP_DIR"
echo -e "${GREEN}✓${NC} Backup directory created at $BACKUP_DIR"
echo ""

# Set up environment variables for cron
echo "Setting up environment variables..."
ENV_FILE="$HOME/.backup-env"

# Read current .env if exists
if [ -f "$BACKUP_SCRIPT_DIR/../server/.env" ]; then
  echo "Reading MONGODB_URI from server .env file..."
  MONGODB_URI=$(grep "^MONGODB_URI=" "$BACKUP_SCRIPT_DIR/../server/.env" | cut -d '=' -f2-)
  
  if [ ! -z "$MONGODB_URI" ]; then
    echo "export BACKUP_DIR=\"$BACKUP_DIR\"" > "$ENV_FILE"
    echo "export RETENTION_DAYS=\"$RETENTION_DAYS\"" >> "$ENV_FILE"
    echo "export MONGODB_URI=\"$MONGODB_URI\"" >> "$ENV_FILE"
    echo -e "${GREEN}✓${NC} Environment file created at $ENV_FILE"
  else
    echo -e "${YELLOW}Warning: MONGODB_URI not found in .env file${NC}"
    echo "You will need to set MONGODB_URI manually in the cron job"
  fi
else
  echo -e "${YELLOW}Warning: Server .env file not found${NC}"
  echo "Creating empty environment file..."
  echo "export BACKUP_DIR=\"$BACKUP_DIR\"" > "$ENV_FILE"
  echo "export RETENTION_DAYS=\"$RETENTION_DAYS\"" >> "$ENV_FILE"
  echo "# export MONGODB_URI=\"your-mongodb-uri-here\"" >> "$ENV_FILE"
  echo -e "${YELLOW}⚠${NC} Please edit $ENV_FILE and add your MONGODB_URI"
fi
echo ""

# Create cron job
CRON_JOB="$CRON_MINUTE $CRON_HOUR * * * . $ENV_FILE && $BACKUP_SCRIPT >> $BACKUP_DIR/backup.log 2>&1"

echo "Proposed cron job:"
echo "$CRON_JOB"
echo ""

# Ask for confirmation
read -p "Do you want to install this cron job? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Add to crontab
  (crontab -l 2>/dev/null | grep -v "backup-mongodb.sh"; echo "$CRON_JOB") | crontab -
  echo -e "${GREEN}✓${NC} Cron job installed successfully"
  echo ""
  echo "Current crontab:"
  crontab -l
else
  echo -e "${YELLOW}Cron job installation cancelled${NC}"
  echo "To install manually, run:"
  echo "  (crontab -l 2>/dev/null; echo '$CRON_JOB') | crontab -"
fi
echo ""

# Test backup
echo "Would you like to test the backup now? (y/n) " -n 1 -r
read
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Running test backup..."
  . "$ENV_FILE"
  "$BACKUP_SCRIPT"
  echo -e "${GREEN}✓${NC} Test backup completed"
  echo ""
  echo "Backup files:"
  ls -lh "$BACKUP_DIR"
else
  echo "To test manually, run:"
  echo "  . $ENV_FILE"
  echo "  $BACKUP_SCRIPT"
fi
echo ""

# Display summary
echo "================================"
echo "Setup Summary"
echo "================================"
echo "Backup script: $BACKUP_SCRIPT"
echo "Backup directory: $BACKUP_DIR"
echo "Retention period: $RETENTION_DAYS days"
echo "Schedule: Daily at $CRON_HOUR:$CRON_MINUTE"
echo "Environment file: $ENV_FILE"
echo ""
echo "Next steps:"
echo "1. Verify the cron job is installed: crontab -l"
echo "2. Check backup logs: tail -f $BACKUP_DIR/backup.log"
echo "3. Monitor backup directory: ls -lh $BACKUP_DIR"
echo "4. Test restore: $BACKUP_SCRIPT_DIR/restore-mongodb.sh <backup-file>"
echo ""
echo -e "${GREEN}Setup completed successfully!${NC}"
