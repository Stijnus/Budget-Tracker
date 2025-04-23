# Supabase Database Management

This directory contains the database schema and migrations for the Budget Tracker application.

## Schema

The `schema.sql` file contains the complete database schema for the application. This can be used to set up a new database from scratch.

## Migrations

The `migrations` directory contains individual migration files that can be applied to update an existing database. Each migration file is named with a timestamp and a description of the changes it makes.

## Applying Migrations

### Using the Migration Script

The easiest way to apply migrations is to use the provided script:

1. First, create a `.env` file in the root directory by copying the `.env.example` file:

```bash
cp .env.example .env
```

2. Edit the `.env` file and fill in your Supabase credentials:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id
```

3. Make the script executable and run it:

```bash
chmod +x scripts/apply-migrations.sh
./scripts/apply-migrations.sh
```

### Using the Supabase CLI

Alternatively, you can use the Supabase CLI directly:

```bash
# Apply migrations to a local Supabase instance
supabase db push --db-url "postgresql://postgres:postgres@localhost:54322/postgres"

# Apply migrations to a remote Supabase instance
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"
```

## Adding a New Migration

To add a new migration, create a new SQL file in the `migrations` directory with a name following the pattern `YYYYMMDD_description.sql`. For example:

```sql
-- 20240501_add_language_column.sql
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
```

Then apply the migration using the methods described above.

## Generating Types

After applying migrations, you should update the TypeScript types to match the new database schema:

```bash
npm run types:generate
```

This will update the `src/lib/database.types.ts` file with the latest database schema.
