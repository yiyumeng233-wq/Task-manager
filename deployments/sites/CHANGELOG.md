# Changelog

## 2026-11-03

- Adapted the existing Task Manager interface for a durable Sites deployment with Vinext.
- Added migration-managed D1 storage, one-time public demo fixtures, atomic task IDs, and optimistic transition updates.
- Preserved administrator/viewer demo accounts and server-side permissions.
- Used Worker-compatible password verification and a hosted secret for signed sessions.
- Adjusted public demo password derivation to the production Worker iteration limit and upgraded existing demo hashes without replacing task data.
- Made the task table horizontally scrollable on small screens.
- Verified both logins, creation, status changes, history, reload persistence, viewer restrictions, deletion, and responsive rendering before publication.
