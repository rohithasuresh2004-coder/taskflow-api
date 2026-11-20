# TaskFlow API

A secure RESTful back-end API for a task-management web application, built with **Node.js, Express and MongoDB (Mongoose)**. It supports user registration/login with JWT authentication and full CRUD operations on tasks, with input validation, centralised error handling, and automated tests.

## Features

- JWT authentication (register, login, current user)
- Passwords hashed with bcrypt (12 salt rounds)
- CRUD for tasks, scoped per user (users only see their own data)
- Filtering, search and pagination on the task list
- Input validation (express-validator) with field-level error messages
- Central error handler returning consistent JSON errors
- Security: Helmet headers, CORS, body-size limit, rate limiting on `/api/auth`, regex escaping for search
- Automated tests with Jest, Supertest and an in-memory MongoDB

## Tech Stack

Node.js 18+, Express 4, MongoDB, Mongoose 8, jsonwebtoken, bcryptjs, express-validator, helmet, Jest, Supertest

## Project Structure

```
taskflow-api/
├── src/
│   ├── app.js                 # Express app (middleware + routes)
│   ├── server.js              # Entry point (DB connection + listen)
│   ├── config/db.js
│   ├── models/                # User.js, Task.js (Mongoose schemas)
│   ├── controllers/           # authController.js, taskController.js
│   ├── routes/                # auth.js, tasks.js (+ validation rules)
│   ├── middleware/            # auth (JWT), validate, errorHandler
│   └── utils/AppError.js
├── tests/                     # Jest + Supertest
├── docs/API.md                # Full API documentation
├── .env.example
└── package.json
```

## Setup

**Prerequisites:** Node.js 18+ and MongoDB (local install or a MongoDB Atlas connection string).

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env        # on Windows: copy .env.example .env
# then edit .env and set MONGO_URI and a long random JWT_SECRET

# 3. Start the server
npm run dev                 # development (nodemon)
npm start                   # production
```

The API runs at `http://localhost:5000`. Check `GET /api/health`.

### Environment variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/taskflow` |
| `JWT_SECRET` | Secret used to sign tokens | long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |

## Running the tests

```bash
npm test
```

Tests use `mongodb-memory-server`, so no running MongoDB instance is needed (it downloads a MongoDB binary on first run).

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in, receive a JWT |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/tasks` | Yes | Create a task |
| GET | `/api/tasks` | Yes | List tasks (filter, search, paginate) |
| GET | `/api/tasks/:id` | Yes | Get one task |
| PUT | `/api/tasks/:id` | Yes | Update a task |
| DELETE | `/api/tasks/:id` | Yes | Delete a task |

Protected routes need the header `Authorization: Bearer <token>`.

Full documentation with request/response examples: **[docs/API.md](docs/API.md)**.

## Quick example (curl)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rohitha","email":"rohitha@example.com","password":"secret123"}'

curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"title":"Finish Week 3 task","priority":"high"}'
```

## License

MIT
