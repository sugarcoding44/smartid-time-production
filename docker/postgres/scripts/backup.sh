#!/bin/bash

# Database connection details (read from environment variables)
DB_NAME="${POSTGRES_DB:-smartid_time}"
DB_USER="${POSTGRES_USER:-postgres}"
BACKUP_DIR="/backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

echo "Starting backup of database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Perform backup
pg_dump -U "$DB_USER" -d "$DB_NAME" -F p > "$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_FILE"

echo "Backup completed: ${BACKUP_FILE}.gz"

# Clean up old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.gz" -type f -mtime +7 -delete

echo "Cleaned up old backups"