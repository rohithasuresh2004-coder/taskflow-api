# TaskFlow API Documentation

**Base URL:** `http://localhost:5000/api`
**Format:** JSON. Send `Content-Type: application/json` with request bodies.
**Authentication:** JWT. Include `Authorization: Bearer <token>` on protected endpoints.

## Response format

Success:
```json
{ "status": "success", "data": { } }
```
Error:
```json
{ "status": "fail", "message": "Description of the problem" }
```
Validation errors (400) also include an `errors` array:
```json
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "A valid email is required" }]
}
```

## Status codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | Deleted (no body) |
| 400 | Validation error / malformed request |
| 401 | Missing, invalid or expired token; wrong credentials |
| 404 | Resource or route not found |
| 409 | Email already registered |
| 429 | Too many requests (auth rate limit) |
| 500 | Unexpected server error |

---

## Health

### GET /health
Returns `200` with `{ "status": "success", "message": "API is running" }`.

---

## Authentication

### POST /auth/register
Create an account.

| Field | Type | Rules |
|---|---|---|
| name | string | required, max 60 chars |
| email | string | required, valid email, unique |
| password | string | required, min 8 chars, at least one number |

**Request**
```json
{ "name": "Rohitha", "email": "rohitha@example.com", "password": "secret123" }
```
**Response 201**
```json
{
  "status": "success",
  "token": "<jwt>",
  "data": { "user": { "id": "665f...", "name": "Rohitha", "email": "rohitha@example.com" } }
}
```
**Errors:** 400 (validation), 409 (email exists)

### POST /auth/login
| Field | Type | Rules |
|---|---|---|
| email | string | required, valid email |
| password | string | required |

**Response 200** – same shape as register.
**Errors:** 400 (validation), 401 (`Incorrect email or password.`)

### GET /auth/me  🔒
Returns the logged-in user.

**Response 200**
```json
{ "status": "success", "data": { "user": { "id": "665f...", "name": "Rohitha", "email": "rohitha@example.com" } } }
```
**Errors:** 401

---

## Tasks 🔒
All task endpoints require a token. Users can only access their own tasks.

### Task object
| Field | Type | Notes |
|---|---|---|
| _id | string | generated |
| title | string | required, max 120 |
| description | string | optional, max 1000 |
| status | string | `todo` (default), `in-progress`, `done` |
| priority | string | `low`, `medium` (default), `high` |
| dueDate | ISO 8601 date | optional |
| owner | string | user id |
| createdAt / updatedAt | date | generated |

### POST /tasks
**Request**
```json
{ "title": "Finish Week 3 task", "description": "Build REST API", "priority": "high", "dueDate": "2026-11-30" }
```
**Response 201**
```json
{
  "status": "success",
  "data": {
    "task": {
      "_id": "6660...", "title": "Finish Week 3 task", "description": "Build REST API",
      "status": "todo", "priority": "high", "dueDate": "2026-11-30T00:00:00.000Z",
      "owner": "665f...", "createdAt": "...", "updatedAt": "..."
    }
  }
}
```
**Errors:** 400, 401

### GET /tasks
Query parameters (all optional):

| Param | Description |
|---|---|
| status | filter by status |
| priority | filter by priority |
| search | case-insensitive match on title |
| page | page number (default 1) |
| limit | items per page (default 10, max 100) |

**Example:** `GET /tasks?status=todo&priority=high&page=1&limit=5`

**Response 200**
```json
{
  "status": "success",
  "results": 1,
  "pagination": { "page": 1, "limit": 5, "total": 1, "pages": 1 },
  "data": { "tasks": [ { "_id": "6660...", "title": "Finish Week 3 task", "status": "todo" } ] }
}
```

### GET /tasks/:id
**Response 200** `{ "status": "success", "data": { "task": { ... } } }`
**Errors:** 400 (invalid id), 401, 404

### PUT /tasks/:id
Update any of `title`, `description`, `status`, `priority`, `dueDate` (partial updates allowed).

**Request**
```json
{ "status": "in-progress" }
```
**Response 200** `{ "status": "success", "data": { "task": { ... } } }`
**Errors:** 400, 401, 404

### DELETE /tasks/:id
**Response 204** (no body)
**Errors:** 400, 401, 404
