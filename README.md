# TaskFlow

TaskFlow is a collaborative task board application. This repository is structured
as a monorepo with a React client and an Express/Mongoose server.

## Day 1: Backend setup

The backend lives in [`server/`](./server/). It includes:

- Express and middleware boilerplate
- MongoDB Atlas connection configuration
- User, board, column, and task Mongoose models
- A health endpoint at `GET /api/health`

### Setup

1. Create a MongoDB Atlas cluster and copy its connection string.
2. Copy `server/.env.example` to `server/.env`.
3. Set `MONGO_URI` and `JWT_SECRET` in `server/.env`.
4. Install dependencies and start the development server:

```bash
cd server
npm install
npm run dev
```

The health endpoint is available at <http://localhost:5000/api/health>.

## Day 3: React client

The React client lives in [`client/`](./client/) and includes:

- Vite and Tailwind CSS v4
- Axios configured to send the authentication cookie
- Zustand auth state
- Login, registration, logout, and protected board-list routes

Start the client in a second terminal:

```bash
cd client
npm install
npm run dev
```

Visit <http://localhost:5173>. Start the backend first so registration and
authentication requests can reach `http://localhost:5000/api`.
