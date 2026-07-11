# SubVault API

A scalable REST API for tracking subscriptions, managing recurring payments, monitoring renewal dates, and analyzing subscription expenses.

## Overview

SubVault api is a backend service designed to help users manage their recurring subscriptions in one place. It provides secure authentication, subscription management, renewal tracking, and expense monitoring capabilities through a RESTful API built with Node.js, Express, and MongoDB.

Whether it's Netflix, Spotify, AWS, ChatGPT, or any other recurring service, SubVault helps users keep track of costs, billing cycles, and upcoming renewals.

---

## Features

### Authentication & Security

- User registration, login, and logout
- JWT-based authentication (stateless bearer tokens)
- Password hashing with bcrypt
- Role-based access control: regular users are scoped to their own account and subscriptions; admins can manage every user and subscription (see [Roles & Access Control](#roles--access-control))
- Request validation on every route with Joi
- Security headers with Helmet, CORS, and gzip compression
- Rate limiting and bot protection using Arcjet

### Subscription Management

- Create, read, update, and delete subscriptions
- Cancel a subscription (idempotent — reports if it's already cancelled)
- Track billing cycles and payment methods
- Auto-calculated renewal dates and auto-expiry based on frequency
- Filter and paginate subscription lists

### Expense Tracking

- Monitor recurring expenses
- Store subscription costs in multiple currencies
- Support multiple billing frequencies (weekly, monthly, yearly)

### Upcoming Renewals

- View active subscriptions renewing within a configurable window
- Monitor upcoming payments to help prevent unexpected charges

---

## Tech Stack

| Category            | Technologies                                 |
| ------------------- | -------------------------------------------- |
| Runtime / Framework | Node.js, Express                             |
| Database            | MongoDB, Mongoose                            |
| Authentication      | JSON Web Tokens (JWT), bcrypt                |
| Validation          | Joi                                          |
| Security            | Helmet, CORS, Arcjet (shield/bot/rate limit) |
| Observability       | Morgan (HTTP logging)                        |

---

## Project Structure

The API follows a layered architecture: **routes** define the URL surface and wire up validation, **controllers** stay thin and only translate HTTP ↔ service calls, **services** hold all business logic and database access, and cross-cutting concerns (errors, response shape, auth tokens) live in **utils**.

```
src/
├── app.js
├── config/
│   ├── env.js
│   └── arcjet.js
├── constants/
│   ├── http-status.constants.js
│   ├── pagination.constants.js
│   ├── role.constants.js
│   └── subscription.constants.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   └── subscription.controller.js
├── database/
│   └── mongodb.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── arcjet.middleware.js
│   ├── validate.middleware.js
│   ├── not-found.middleware.js
│   └── error.middleware.js
├── models/
│   ├── user.model.js
│   └── subscription.model.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   └── subscription.routes.js
├── services/
│   ├── auth.service.js
│   ├── user.service.js
│   └── subscription.service.js
├── utils/
│   ├── appError.js
│   ├── asyncHandler.js
│   ├── apiResponse.js
│   ├── jwt.js
│   └── password.js
└── validations/
    ├── common.validation.js
    ├── auth.validation.js
    ├── user.validation.js
    └── subscription.validation.js
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/khrlmln/SubVault.git

cd SubVault
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the root directory (see `.env.example`):

```env
PORT=5500
NODE_ENV=development
DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
CLIENT_URL=
```

### Start development server

```bash
npm run dev
```

### Start production server

```bash
npm start
```

---

## API Endpoints

All endpoints are prefixed with `/api/v1`. Endpoints marked 🔒 require an `Authorization: Bearer <token>` header; endpoints marked 👑 additionally require that token to belong to an `admin` (see [Roles & Access Control](#roles--access-control)).

### Authentication

| Method | Endpoint         | Description                |
| ------ | ---------------- | -------------------------- |
| POST   | `/auth/sign-up`  | Register a new user        |
| POST   | `/auth/sign-in`  | Log in and receive a token |
| POST   | `/auth/sign-out` | Sign out                   |

### Users

| Method | Endpoint         |     | Description                                                          |
| ------ | ---------------- | --- | -------------------------------------------------------------------- |
| GET    | `/users`         | 👑  | List all users (paginated, filterable by `role`)                     |
| GET    | `/users/:id`     | 👑  | Get any user by ID                                                   |
| PATCH  | `/users/:id`     | 👑  | Update any user's name, email, or role                               |
| DELETE | `/users/:id`     | 👑  | Delete any user's account (an admin can't delete their own this way) |
| GET    | `/users/profile` | 🔒  | Get the current user's profile                                       |
| PATCH  | `/users/profile` | 🔒  | Update the current user's profile                                    |
| DELETE | `/users/profile` | 🔒  | Delete the current user's account (requires password confirmation)   |

### Subscriptions

| Method | Endpoint                           |     | Description                                            |
| ------ | ---------------------------------- | --- | ------------------------------------------------------ |
| POST   | `/subscriptions`                   | 🔒  | Create a subscription for yourself                     |
| GET    | `/subscriptions`                   | 🔒  | List subscriptions (paginated, filterable by `status`) |
| GET    | `/subscriptions/upcoming-renewals` | 🔒  | List active subscriptions renewing soon (`?days=7`)    |
| GET    | `/subscriptions/:id`               | 🔒  | Get a subscription by ID                               |
| PATCH  | `/subscriptions/:id`               | 🔒  | Update a subscription                                  |
| DELETE | `/subscriptions/:id`               | 🔒  | Delete a subscription                                  |
| PATCH  | `/subscriptions/:id/cancel`        | 🔒  | Cancel a subscription                                  |

Every row above is reachable by any authenticated user, but the _scope_ depends on role: a regular user only ever sees, updates, or deletes their **own** subscriptions, while an **admin** can reach any user's subscriptions. Admins can also add `?userId=<id>` to `GET /subscriptions` to view one specific customer's subscriptions instead of the full list.

### Health

| Method | Endpoint  | Description                                      |
| ------ | --------- | ------------------------------------------------ |
| GET    | `/health` | Liveness/readiness check (uptime, DB connection) |

All list endpoints accept `?page=1&limit=10` (max `limit` is 100).

---

## Roles & Access Control

Every account has a `role` of either `user` (the default) or `admin`:

- **`user`** — can only read and modify their **own** profile (`/users/profile`) and their **own** subscriptions.
- **`admin`** — everything a `user` can do, plus managing every account (`/users`, `/users/:id`) and every subscription, regardless of who owns it.

Sign-up always creates a `user` account — there's no way to request `admin` over the API, by design. To promote (or demote) an account, you need to update role to `admin` directly inside database:

This is the only way to create the very first admin. From there, that admin can promote others through `PATCH /users/:id`.

Two deliberate guardrails on the admin routes prevent an admin from locking themselves out:

- An admin cannot change their **own** role through `PATCH /users/:id` (only someone else's).
- An admin cannot delete their **own** account through `DELETE /users/:id` — that always requires the password-confirmed `DELETE /users/profile` instead.

---

## Request & Response Format

Every response — success or error — uses the same envelope:

```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": { "...": "..." }
}
```

Errors follow the same shape with `"success": false` and no `data`:

```json
{
  "success": false,
  "message": "Subscription not found"
}
```

Validation failures return `422 Unprocessable Entity` with a `message` describing every invalid field.

---

## Validation

Every route validates its `body`, `params`, and/or `query` against a [Joi](https://joi.dev) schema (see `src/validations/`) before the request reaches a controller. Validation:

- Rejects unknown fields (`stripUnknown`) rather than silently passing them through
- Coerces and defaults query params (e.g. `page`, `limit`, `days`)
- Whitelists updatable fields — a client can never set `user` on a subscription or otherwise write fields it shouldn't
- Returns every validation error at once (`abortEarly: false`) instead of one at a time

---

## Security Measures

- Passwords hashed with bcrypt (never returned in any API response)
- JWT authentication required on every non-auth route, re-verified against the database on every request (a deleted account or a changed role takes effect immediately, even with a still-valid token)
- Role-based access control: a regular user's subscription/profile lookups are scoped to their own data — they can't read, modify, or delete another user's data by guessing an ID — while admins can act on any user or subscription through the dedicated admin routes
- Role can never be set or changed by a client at sign-up; the only way to create the first admin is the change role to `admin` in the database
- Sign-in returns an identical error/status for "no such account" and "wrong password" to avoid leaking which emails are registered
- Security headers via Helmet; CORS restricted via `CLIENT_URL` in production
- Rate limiting and bot protection with Arcjet (`trust proxy` enabled so this works correctly behind a reverse proxy/load balancer)
- Request body size limits to reduce large-payload abuse
- Environment-based configuration, validated at startup; no secrets committed to source
- Unexpected errors never leak internal details to the client in production

---

## License

This project is licensed under the MIT License.

---

## Author

**Milan Kharel**

- [GitHub](https://github.com/khrlmln)
- [GitLab](https://gitlab.com/khrlmln)

---

Built with Node.js, Express, MongoDB, and a focus on scalable backend architecture.
