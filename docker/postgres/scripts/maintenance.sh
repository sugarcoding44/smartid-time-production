#!/bin/bash

# Database connection details (read from environment variables)
DB_NAME="${POSTGRES_DB:-smartid_time}"
DB_USER="${POSTGRES_USER:-postgres}"

echo "Starting maintenance tasks for database: $DB_NAME"

# Vacuum analyze all tables
echo "Running VACUUM ANALYZE..."
psql -U "$DB_USER" -d "$DB_NAME" -c "VACUUM ANALYZE;"

# Update statistics
echo "Updating statistics..."
psql -U "$DB_USER" -d "$DB_NAME" -c "ANALYZE VERBOSE;"

# Reindex the database
echo "Reindexing database..."
psql -U "$DB_USER" -d "$DB_NAME" -c "REINDEX DATABASE \"$DB_NAME\";"

# Show database size and table sizes
echo "Database sizes:"
psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
    schema_name,
    pg_size_pretty(sum(table_size)::bigint) as total_size,
    pg_size_pretty(sum(table_size - index_size)::bigint) as table_size,
    pg_size_pretty(sum(index_size)::bigint) as index_size,
    pg_size_pretty(sum(toast_size)::bigint) as toast_size
FROM (
    SELECT
        table_schema as schema_name,
        pg_total_relation_size(quote_ident(table_schema) || '.' || quote_ident(table_name)) as table_size,
        pg_indexes_size(quote_ident(table_schema) || '.' || quote_ident(table_name)) as index_size,
        pg_total_relation_size(reltoastrelid) as toast_size
    FROM information_schema.tables
    JOIN pg_class ON relname = table_name
    LEFT JOIN pg_namespace ON pg_namespace.nspname = table_schema
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
) sub
GROUP BY schema_name
ORDER BY sum(table_size) DESC;"

echo "Maintenance completed"