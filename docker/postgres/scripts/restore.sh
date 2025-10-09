#!/bin/bash

# Database connection details (read from environment variables)
DB_NAME="${POSTGRES_DB:-smartid_time}"
DB_USER="${POSTGRES_USER:-postgres}"
BACKUP_DIR="/backups"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Error: No backup file specified"
    echo "Usage: $0 <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Starting restore of database: $DB_NAME"
echo "Using backup file: $BACKUP_FILE"

# If file is gzipped, uncompress it first
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Uncompressing backup file..."
    gunzip -c "$BACKUP_FILE" | psql -U "$DB_USER" -d "$DB_NAME"
else
    psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"
fi

echo "Restore completed"