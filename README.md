# Teamliva — Backend API

Express + Mongoose REST API behind the Teamliva site. Handles every public form
submission and serves the guarded operations dashboard.

## Stack

Express 4 · Mongoose 8 · JWT (`jsonwebtoken`) · bcryptjs · CORS · Helmet ·
express-rate-limit · Morgan

## Getting started

```bash
npm install
cp .env.example .env    # then fill in the values
npm run seed            # loads services + talents, optionally the first admin
npm run dev             # http://localhost:5000
```

### Environment

| Variable         | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `PORT`           | Defaults to `5000`                                          |
| `MONGODB_URI`    | MongoDB connection string — **required**                    |
| `JWT_SECRET`     | Long random string — **required**. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d`                                |
| `CORS_ORIGIN`    | Comma-separated allowed origins                             |
| `DNS_SERVERS`    | Optional. Only for `querySrv ECONNREFUSED` — see below      |
| `SEED_ADMIN_*`   | Optional, used by `npm run seed` to create the first admin  |

> **`querySrv ECONNREFUSED` on a `mongodb+srv://` URI** is a DNS failure, not a
> bad password: Node's resolver can't do SRV lookups. Set
> `DNS_SERVERS=1.1.1.1,8.8.8.8` in `.env` and retry.

## Collections

| Model         | Fed by                          |
| ------------- | ------------------------------- |
| `Inquiry`     | 3-step quote modal              |
| `Contact`     | `/contact` page form            |
| `Application` | `/careers` page form            |
| `Newsletter`  | Footer email capture            |
| `Talent`      | Public roster (seeded/managed)  |
| `Service`     | Solutions matrix (seeded/managed) |
| `User`        | Admin/ops accounts              |

## Endpoints

Public:

```
GET    /api/health
POST   /api/inquiries        POST /api/contacts
POST   /api/applications     POST /api/newsletter
GET    /api/talents          GET  /api/talents/:id
GET    /api/services         GET  /api/services/:slug
POST   /api/auth/login
POST   /api/auth/register    # open only until the first account exists
```

Protected — `Authorization: Bearer <token>`:

```
GET    /api/auth/me          GET  /api/stats
GET    /api/inquiries        PATCH /api/inquiries/:id
GET    /api/contacts         PATCH /api/contacts/:id
GET    /api/applications     PATCH /api/applications/:id
GET    /api/newsletter
POST   /api/talents          PUT  /api/talents/:id
POST   /api/services         PUT  /api/services/:id
DELETE /api/{resource}/:id   # admin role only
```

Every response is `{ success, message?, data? }`; validation failures return
`400` with a per-field `errors` object the frontend renders inline.

## First admin account

`POST /api/auth/register` is open **only while the users collection is empty**.
The first account created becomes `admin`; after that the endpoint requires an
existing admin's token. Alternatively set `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` and run `npm run seed`.

## Notes

- Passwords are bcrypt-hashed (cost 12) in a `pre('save')` hook and excluded
  from queries by default (`select: false`).
- `/api` is rate limited to 300 requests per 15 minutes per IP.
- `.env` is gitignored — never commit real credentials.
# team-liva-backend
