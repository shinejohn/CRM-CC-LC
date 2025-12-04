# Database Migrations

This directory contains SQL migration files for the Learning Center database.

**Note:** These SQL migrations will be converted to Laravel migrations when the Railway backend is set up.

## Migration Files

- `001_initial_schema.sql` - Core schema (knowledge_base, FAQs, surveys, indexes, functions)
- `002_add_presentation_tables.sql` - Presentation system tables

## Running Migrations

### Railway PostgreSQL

These migrations will be converted to Laravel migrations and run using:

```bash
php artisan migrate
```

### Manual Connection (For Testing)

Connect directly to Railway PostgreSQL using psql:

```bash
psql $DATABASE_URL
```

Or with separate connection details:

```bash
psql -h host.railway.app -p 5432 -U user -d railway
```

## Migration Order

Migrations must be run in order:
1. 001_initial_schema.sql
2. 002_add_presentation_tables.sql

## Notes

- The `vector` extension requires pgvector to be installed in Aurora PostgreSQL
- All timestamps use TIMESTAMPTZ (timezone-aware)
- UUIDs are used for primary keys for distributed system compatibility


