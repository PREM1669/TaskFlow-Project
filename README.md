# TaskFlow

TaskFlow is a real-time collaborative Kanban board built with React, Express,
MongoDB, and Socket.io. It is organized as a monorepo:

- [`client/`](./client/) — Vite/React frontend with Tailwind CSS, Zustand, and dnd-kit
- [`server/`](./server/) — Express REST API, Mongoose models, JWT authentication, and Socket.io
- [`docs/erd.dbml`](./docs/erd.dbml) — database relationship diagram source

## Features

- User registration, login, logout, and authenticated sessions
- Board, column, and task CRUD
- Drag-and-drop task and column ordering
- Owner/collaborator permissions
- Live board updates, presence, and dismissible activity alerts
- Responsive mobile navigation and touch dragging
- Light/dark mode toggle

## Local setup

### Backend

1. Create a MongoDB Atlas database and copy its connection string.
2. Copy [`server/.env.example`](./server/.env.example) to `server/.env`.
3. Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` in `server/.env`.
4. Install dependencies and start the API:

```bash
cd server
npm install
npm run dev
```

The API runs on `http://localhost:5000` by default. Check
`GET /api/health` to verify it is available.

### Frontend

1. Copy [`client/.env.example`](./client/.env.example) to `client/.env`.
2. Keep the local values unless the API is running on another host.
3. Start the Vite development server:

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` by default.

## Environment variables

### Server

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas connection string |
| `PORT` | API port, default `5000` |
| `CLIENT_URL` | Exact frontend origin allowed by CORS |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `NODE_ENV` | Set to `production` for secure cross-domain cookies |

### Client

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | REST API base URL, including `/api` |
| `VITE_SOCKET_URL` | Socket.io server origin |

Environment files containing credentials are ignored by Git. Commit only the
`.env.example` templates.

## Architecture

REST endpoints are the source of truth for persistence. The frontend sends
authenticated CRUD and movement requests to Express. After a successful write,
Socket.io broadcasts the change to members in the board-scoped room. Socket
handshakes authenticate using the HTTP-only JWT cookie and verify board
membership before joining a room.

The data relationships are documented in [`docs/erd.dbml`](./docs/erd.dbml).

## Testing and validation

Backend tests use Jest, Supertest, and `mongodb-memory-server`, so they do not
modify the development database:

```bash
cd server
npm test
```

Build the frontend for a production check:

```bash
cd client
npm run build
```

For manual responsive checks, test approximately 375px, 768px, and desktop
widths. On mobile, the sidebar opens with the Menu button and board columns
remain horizontally scrollable.

## Deployment

### Render (backend)

1. Create a Render Web Service connected to this repository.
2. Set the root directory to `server`.
3. Use `npm install` as the build command and `npm start` as the start command.
4. Add `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `NODE_ENV=production`.
5. Set `CLIENT_URL` to the final Vercel frontend URL exactly, including scheme
   and without a trailing path.

### Vercel (frontend)

1. Import the repository into Vercel.
2. Set the root directory to `client`.
3. Add `VITE_API_URL=https://<render-host>/api`.
4. Add `VITE_SOCKET_URL=https://<render-host>`.
5. Redeploy the backend after updating `CLIENT_URL`.

After deployment, verify registration, board creation, task movement, and the
same-board two-browser real-time update flow. Do not place credentials or
deployment-specific URLs in tracked source files.
