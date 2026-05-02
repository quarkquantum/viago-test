Migration Guide for Viago

- Purpose: Provide a safe, local-dev oriented path to apply Prisma migrations without exposing secrets in version control.
- Scope: Development and local testing environments in the Viago monorepo.

Overview
- Prisma migrations are tracked under packages/database/prisma/migrations.
- Do not commit real environment files (.env). Use environment overrides or templates for sharing.

How to run migrations locally (safe, no secrets committed)
- Ensure you have a Postgres instance running and the appropriate credentials accessible via environment.
- Use the provided script to run migrations in dev mode.
- If you need to run production migrations, configure environment separately and use the prod script with caution.

Steps
