# Task Manager Hosted Edition

A persistent public demo of the Task Manager application, running on Sites with Vinext and Cloudflare D1.

The original local Next.js application remains in the GitHub repository root. Hosted source is mirrored under `deployments/sites/`.

## Development

```bash
npm ci
npm run db:generate # only after changing db/schema.ts
npm run dev
```

Apply generated migrations to the local D1 database before using the preview. Configure `SESSION_SECRET` as a hosted secret before deployment. The local preview has a development-only signing key.

Demo credentials: `admin@example.com` / `admin123`, or `viewer@example.com` / `viewer123`. These accounts intentionally share public demo data. Do not store private information in this demo.
