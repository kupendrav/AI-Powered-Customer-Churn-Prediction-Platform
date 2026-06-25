# Contributing to ChurnAI

Thanks for helping improve ChurnAI. This project is open source and uses InsForge as the managed backend for auth, database, RLS, migrations, and secrets.

## Setup

1. Fork or branch from `main`.
2. Install frontend dependencies:

```bash
cd frontend
npm ci --legacy-peer-deps
```

3. Create a local `.env` from `.env.example`.
4. Link the InsForge project:

```bash
npx @insforge/cli link --project-id b12ac892-a27c-450a-b90a-02f2eedafc31
```

5. Apply migrations:

```bash
npx @insforge/cli db migrations up --all
```

## Branch and PR Workflow

- Use short feature branches such as `feature/insforge-profile-roles` or `fix/kpi-risk-count`.
- Keep PRs focused on one behavior change.
- Include screenshots for visible UI changes.
- Include migration notes for schema changes.
- Never commit local secrets, `.env`, `.env.local`, `.insforge/project.json`, generated keys, or real database URLs.

## Code Style

- Match existing FastAPI, SQLAlchemy, Next.js, and TypeScript patterns.
- Keep app-owned database objects in the `public` schema.
- Use InsForge SDK helpers for frontend auth and database access.
- Use FastAPI for ML inference and API orchestration.
- Avoid storing large frequently-read payloads in JSONB; use typed columns where data is filtered or displayed in lists.

## InsForge Migration Workflow

Create migrations through the CLI:

```bash
npx @insforge/cli db migrations new your-change-name
```

Then edit the generated file under `migrations/` and apply it:

```bash
npx @insforge/cli db migrations up --all
```

Migration rules:

- Use lowercase, hyphenated migration names.
- Do not edit migrations after they have been applied remotely.
- Add RLS policies and SQL grants with every app table.
- Reference users with `auth.users(id)` and `auth.uid()`.
- Use `SECURITY DEFINER` helpers for RLS role checks that read RLS-enabled tables.
- Use `system.update_updated_at()` for `updated_at` triggers.

## Tests Before PR

Run the checks that match your change:

```bash
cd backend
pytest app/tests/ -v --tb=short
```

```bash
cd frontend
npx tsc --noEmit
npm run lint
npm run build
```

```bash
pytest tests/ml/ -v --tb=short
```

For schema work, also verify the linked backend:

```bash
npx @insforge/cli db migrations list
npx @insforge/cli db query "select count(*) from public.customers" --json
```

## Security

- Keep `INSFORGE_API_KEY`, Postgres passwords, OpenRouter keys, and service credentials server-only.
- `NEXT_PUBLIC_INSFORGE_ANON_KEY` is the only InsForge key intended for frontend exposure.
- Rotate any secret that was accidentally committed.
- Prefer InsForge CLI and SDK workflows over direct ad hoc backend calls.
