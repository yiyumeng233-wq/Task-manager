import type { Task, User } from "../lib/types";

// Public demonstration fixtures only; never import a private local database.
export const seed: { users: User[]; tasks: Task[] } = {
  "users": [
    {
      "id": "u_admin",
      "name": "Yuheng Yang",
      "email": "admin@example.com",
      "passwordHash": "pbkdf2:100000:f09f37a6254b48072eea7541a515c0b6:b6b5d864e0ebc43083e08dbe6b976d74ae6149a971850bca0c8067bf1a6509df",
      "role": "Administrator"
    },
    {
      "id": "u_viewer",
      "name": "Yuheng Yang",
      "email": "viewer@example.com",
      "passwordHash": "pbkdf2:100000:c006ca3c8939cb35b75fb4440e4cc80e:d7806e29ae9225f20813fb49deba5811d256af58c1850e31a755a638a8fea91a",
      "role": "Viewer"
    }
  ],
  "tasks": [
    {
      "id": "T-001",
      "title": "Set up the project skeleton",
      "description": "App Router + TypeScript + Tailwind. Agree on the folder layout first so every later change lands in the same place.",
      "assignee": "Yuheng Yang",
      "status": "Done",
      "createdBy": "Yuheng Yang",
      "createdAt": "2026-10-25T08:12:00.000Z",
      "updatedAt": "2026-10-27T15:40:00.000Z",
      "history": [
        {
          "at": "2026-10-25T08:12:00.000Z",
          "from": null,
          "to": "Pending",
          "by": "Yuheng Yang",
          "note": "Created"
        },
        {
          "at": "2026-10-26T10:30:00.000Z",
          "from": "Pending",
          "to": "Approve",
          "by": "Yuheng Yang",
          "note": "Layout looks sensible, approved"
        },
        {
          "at": "2026-10-27T14:10:00.000Z",
          "from": "Approve",
          "to": "To Do",
          "by": "Task Reviewer",
          "note": "Into this sprint"
        },
        {
          "at": "2026-10-27T15:40:00.000Z",
          "from": "To Do",
          "to": "Done",
          "by": "Yuheng Yang",
          "note": "Done and self-reviewed"
        }
      ]
    },
    {
      "id": "T-002",
      "title": "Session-based login",
      "description": "Keep the session in an httpOnly cookie signed with HMAC, hash passwords with scrypt. Login survives a refresh and dies on sign out.",
      "assignee": "Yuheng Yang",
      "status": "To Do",
      "createdBy": "Yuheng Yang",
      "createdAt": "2026-10-28T09:05:00.000Z",
      "updatedAt": "2026-11-01T13:20:00.000Z",
      "history": [
        {
          "at": "2026-10-28T09:05:00.000Z",
          "from": null,
          "to": "Pending",
          "by": "Yuheng Yang",
          "note": "Created"
        },
        {
          "at": "2026-10-29T08:50:00.000Z",
          "from": "Pending",
          "to": "Approve",
          "by": "Yuheng Yang",
          "note": "High priority, blocking the rest"
        },
        {
          "at": "2026-11-01T13:20:00.000Z",
          "from": "Approve",
          "to": "To Do",
          "by": "Task Reviewer",
          "note": "Picked up"
        }
      ]
    },
    {
      "id": "T-003",
      "title": "Role-based permission check",
      "description": "Administrators create tasks, review status and delete them. Viewers only read. The check has to run on the server — hiding a button is not a boundary.",
      "assignee": "Yuheng Yang",
      "status": "Approve",
      "createdBy": "Task Reviewer",
      "createdAt": "2026-10-30T14:20:00.000Z",
      "updatedAt": "2026-10-31T09:15:00.000Z",
      "history": [
        {
          "at": "2026-10-30T14:20:00.000Z",
          "from": null,
          "to": "Pending",
          "by": "Task Reviewer",
          "note": "Created"
        },
        {
          "at": "2026-10-31T09:15:00.000Z",
          "from": "Pending",
          "to": "Approve",
          "by": "Yuheng Yang",
          "note": "Approved"
        }
      ]
    },
    {
      "id": "T-004",
      "title": "Status transition guard",
      "description": "Keep Pending → Approve → To Do → Done in one table shared by the UI and the server. Illegal moves get rejected server-side, not just greyed out.",
      "assignee": "Yuheng Yang",
      "status": "Pending",
      "createdBy": "Yuheng Yang",
      "createdAt": "2026-10-31T13:02:00.000Z",
      "updatedAt": "2026-10-31T13:02:00.000Z",
      "history": [
        {
          "at": "2026-10-31T13:02:00.000Z",
          "from": null,
          "to": "Pending",
          "by": "Yuheng Yang",
          "note": "Created"
        }
      ]
    },
    {
      "id": "T-005",
      "title": "Replace JSON store with SQLite",
      "description": "A JSON file is fine for one person. Concurrent writes need transactions — move to Prisma + SQLite and keep the function signatures unchanged.",
      "assignee": "Yuheng Yang",
      "status": "Pending",
      "createdBy": "Task Reviewer",
      "createdAt": "2026-11-01T16:35:00.000Z",
      "updatedAt": "2026-11-01T16:35:00.000Z",
      "history": [
        {
          "at": "2026-11-01T16:35:00.000Z",
          "from": null,
          "to": "Pending",
          "by": "Task Reviewer",
          "note": "Created"
        }
      ]
    },
    {
      "id": "T-006",
      "title": "Add audit log export",
      "description": "Export the status history of every task to CSV, so we can tell who changed what and when after the fact.",
      "assignee": "Unassigned",
      "status": "Cancelled",
      "createdBy": "Task Reviewer",
      "createdAt": "2026-10-26T09:48:00.000Z",
      "updatedAt": "2026-10-28T08:30:00.000Z",
      "history": [
        {
          "at": "2026-10-26T09:48:00.000Z",
          "from": null,
          "to": "Pending",
          "by": "Task Reviewer",
          "note": "Created"
        },
        {
          "at": "2026-10-28T08:30:00.000Z",
          "from": "Pending",
          "to": "Cancelled",
          "by": "Yuheng Yang",
          "note": "Out of scope for now"
        }
      ]
    }
  ]
};
