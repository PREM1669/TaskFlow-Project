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

The React client is reserved for Day 3.
