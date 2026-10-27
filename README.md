# Task Manager

A small task manager built as a standalone project: Next.js, login with two roles, and a five-state workflow.

> 📐 **Architecture & component notes**: [`docs/架构与组件设计.md`](docs/架构与组件设计.md) — overall architecture, component tree, data model, key flows and the state machine, with 6 diagrams ([HTML](docs/架构与组件设计.html) / [PDF](docs/架构与组件设计.pdf)).

```bash
npm install
npm run dev        # http://localhost:3000
```

Two accounts are seeded on first run:

| Email | Password | Role |
| --- | --- | --- |
| `admin@example.com` | `admin123` | Administrator |
| `viewer@example.com` | `viewer123` | Viewer |

The login page also lists them, one click fills the form.

```bash
npm test                     # 13 tests: workflow rules + store
npm run build && npm start   # run it the way production would
```

---

## What it does

- **Login** — email + password, session in a signed httpOnly cookie.
- **Two roles** — Administrators create tasks, move them through the workflow and delete them. Viewers read only.
- **Five states** — `Pending → Approve → To Do → Done`, plus `Cancelled` from any non-final state.
- **History** — every transition is recorded with who, when, and from/to.
- **Filters** — the list can be filtered by status, with counts on each tab.

No registration flow: the brief asks for login and roles, not a signup funnel, and every extra form is another place to get validation wrong.

---

## Folder layout

```
app/
  layout.tsx            root shell + fonts
  page.tsx              /  →  /tasks or /login
  login/page.tsx
  tasks/page.tsx        list, filterable by status
  tasks/new/page.tsx    create, Administrators only
  tasks/[id]/page.tsx   detail + transitions
components/             only what needs 'use client' or is reused
lib/
  types.ts              Task, User, TaskStatus
  workflow.ts           transition table + label/colour metadata
  auth.ts               HMAC-signed cookie session
  password.ts           scrypt hash + timing-safe compare
  store.ts              the only file that touches storage
  actions.ts            "use server" mutations
data/db.json            created on first run
test/                   node:test suites
```

---

## Design notes

**The transition table is the single source of truth.** `lib/workflow.ts` holds `TRANSITIONS`, and three things read it: the detail page (which buttons to offer), the server action (whether to accept), and the tests (which combinations must fail). Adding a state means editing one object.

**Permission is checked twice, on purpose.** The page hides actions a Viewer cannot take — that is usability. The server action re-checks the role — that is security. Hiding a button is not a boundary; anyone can craft the request.

**Every check happens before any write.** `transitionAction` validates session → role → target status → whether the move is legal from the *stored* current status, and only then writes. A failed check leaves the data untouched.

**Sessions are a signed payload, not a JWT.** Only one property is needed: the server must be able to tell whether the payload was tampered with. HMAC-SHA256 does that in four lines, with no dependency and no algorithm choice to get wrong. It lives in an httpOnly cookie, so page scripts cannot read it, and it dies on sign out.

**Passwords are stored as `salt:hash` using scrypt.** Node ships it, so there is no native module to compile. Comparison uses `timingSafeEqual`.

**Storage is a JSON file behind a narrow seam.** `lib/store.ts` is the only module that reads or writes anything. Writes go to a temp file and are renamed into place, so a crash mid-write cannot leave half a document. That is enough for one reviewer clicking around; it is not enough for concurrent users, which is the first item under "what I'd change".

---

## What I'd change with more time

1. **SQLite + Prisma** — the JSON file is rewritten in full on every mutation, and two simultaneous writes can lose one. Only `lib/store.ts` changes; call sites just gain `await`.
2. **Revocable sessions** — a signed cookie cannot be invalidated before it expires. Storing sessions (or a per-user version counter) would allow "sign out everywhere".
3. **Optimistic locking** — the read-then-write gap in `transitionAction` is small but real. A `version` field plus a conditional update closes it.
4. **Pagination and search** — six tasks do not need it, six hundred do. Both live in the page, not the store.

---

## Notes

Code comments are in Chinese (written to go with a Chinese-language Next.js walkthrough); UI copy and this README are in English.

Tests point `DB_PATH` at a temp file, so running them never touches `data/db.json`.
