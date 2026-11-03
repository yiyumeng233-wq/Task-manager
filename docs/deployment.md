# Hosted deployment

## Public demo

[Open Task Manager](https://yuheng-task-manager.yiyumeng233.chatgpt.site)

The HTTPS site runs independently of the developer's computer. Sites hosts the Worker, and Cloudflare D1 persists task data across requests and deployments. Hosting remains subject to the provider's availability, account status, and service limits; it is not a guarantee of perpetual hosting.

| Account | Password | Role |
| --- | --- | --- |
| `admin@example.com` | `admin123` | Administrator |
| `viewer@example.com` | `viewer123` | Viewer |

These are public demo accounts. Their tasks are shared by all visitors; do not enter private information. An administrator can modify or delete demo tasks.

## Source organization

- The repository root retains the original local Next.js application and JSON store. Its existing `npm run dev`, `npm run build`, and `npm start` commands are unchanged.
- `deployments/sites/` is a source mirror of the hosted Vinext edition, including Worker integration, D1 schema, schema-only migrations, and public seed fixtures. It has a separate package manifest and lockfile.
- The active Sites checkout is `C:\Users\yang\Documents\Codex\2026-10-27\bang\sites\task-manager`. Its managed source repository is separate from the GitHub source mirror.
- Site identity is recorded in `deployments/sites/.openai/hosting.json`. Reuse this identity for future deployments instead of registering a new Site.
- The current hosted source commit is `6f1b27a6e0c2e38e6a4445ae4d4e15f6bfccb90b`, published as Site version 2 on 2026-11-03. This includes the production Worker password-verification compatibility repair.
- The first hosted source commit is `bfd34c7d1703d2c980b5c726fe1e993b04cba0f3`, published as Site version 1 on 2026-11-03.

## Storage and sessions

The hosted store uses migration-managed tables for demo users, task records, and initialization metadata. Initialization inserts public fixtures only once. Deleting a seed task does not cause it to reappear after a subsequent request or deployment. New task IDs use SQLite's automatic numbering. Transition updates use a version check to avoid overwriting concurrent changes.

The hosted edition uses Web Crypto PBKDF2 to verify public demo passwords and an httpOnly, signed session cookie. The `SESSION_SECRET` is stored as a secret in the Sites runtime, not in GitHub or the hosting manifest. The local development server has a separate development-only key.

The local JSON database was not uploaded. Hosted data begins with the documented public demo fixtures.

## Updating the hosted edition

1. Open the existing Site source using the Sites workflow and its configured project ID.
2. Edit the hosted checkout. Keep `Yuheng Yang`, English source comments, and generic Task Manager branding.
3. For a schema change, update `db/schema.ts`, run `npm run db:generate`, and review the new schema-only SQL migration. Do not edit an applied migration.
4. Build with the Sites build helper; apply pending migrations to local D1 for preview testing.
5. Verify login, role permissions, task creation, transitions, history, and deletion.
6. Use the Sites source workflow to commit/push the source and package that exact commit, then save and deploy the version to this existing public Site.
7. Refresh the GitHub mirror under `deployments/sites/`, update `CHANGELOG.md`, and commit/push the GitHub repository.

Changes to the root local application do not automatically publish the hosted edition. An explicit Site build and deployment are required.

## Local hosted-edition preview

Inside the hosted checkout, install from its lockfile and build once. Apply each pending migration using its exact filename, for example:

```powershell
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_fat_silver_sable.sql
npm run dev
```

Open the local address printed by the server, normally `http://127.0.0.1:5173`. Local D1 state is separate from the hosted database.

## Verification

The public production deployment passed both role logins, display-name checks, task creation, status transitions, history rendering, reload persistence, viewer route restrictions, deletion, and mobile rendering. The original local project passed all 13 tests and its production build.
