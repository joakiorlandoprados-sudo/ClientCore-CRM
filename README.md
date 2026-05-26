# ClientCore CRM

ClientCore is a full-stack CRM built with Angular 17, Node.js, Express, Prisma, PostgreSQL, JWT auth, and role-based access control.

## Architecture

```text
clientcore/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── middlewares/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── clients/
│       │   ├── contacts/
│       │   ├── deals/
│       │   ├── tasks/
│       │   ├── notes/
│       │   └── dashboard/
│       ├── types/
│       ├── utils/
│       ├── app.ts
│       └── server.ts
├── frontend/
│   └── src/app/
│       ├── core/
│       ├── shared/
│       ├── features/
│       └── layout/
├── docker-compose.yml
└── package.json
```

Backend modules follow `router -> controller -> service -> repository`. Frontend features use standalone Angular components, signals, route guards, typed services, and Reactive Forms.

## Setup

```bash
cd clientcore
npm install
```

Create or review `backend/.env`. A local development `.env` is included; production secrets should be replaced.

Start PostgreSQL:

```bash
npm run infra:up
```

Run Prisma migration and seed:

```bash
npm run db:migrate
npm run db:seed
```

Start the API and frontend in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

Or serve the production Angular build:

```bash
npm run build --workspace frontend
npm run serve:frontend
```

Open:

```text
Frontend: http://localhost:4200
Backend:  http://localhost:3000/api/health
```

## Seed Users

All seeded users use:

```text
Password123!
```

```text
admin@clientcore.dev      ADMIN
manager1@clientcore.dev   MANAGER
manager2@clientcore.dev   MANAGER
sales1@clientcore.dev     SALES
sales2@clientcore.dev     SALES
sales3@clientcore.dev     SALES
```

## Environment

Required backend variables are documented in `backend/.env.example`:

```text
NODE_ENV
PORT
DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
CORS_ORIGIN
```

## API Summary

All API responses follow:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

### Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/logout-all
```

### Users

Admin only.

```text
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

`DELETE /api/users/:id` deactivates the user instead of physically deleting the account.

### Clients

```text
GET    /api/clients?industry=&assignedTo=&search=&page=&limit=
POST   /api/clients
GET    /api/clients/:id
PATCH  /api/clients/:id
DELETE /api/clients/:id
GET    /api/clients/:id/contacts
GET    /api/clients/:id/deals
GET    /api/clients/:id/notes
```

### Contacts

```text
GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/:id
PATCH  /api/contacts/:id
DELETE /api/contacts/:id
```

### Deals

```text
GET    /api/deals?stage=&assignedTo=&clientId=&page=&limit=
GET    /api/deals/aggregate/stages
POST   /api/deals
GET    /api/deals/:id
PATCH  /api/deals/:id
PATCH  /api/deals/:id/stage
DELETE /api/deals/:id
```

### Tasks

```text
GET    /api/tasks?status=&priority=&assignedTo=&dueDate=&page=&limit=
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
PATCH  /api/tasks/:id/complete
DELETE /api/tasks/:id
```

### Notes

```text
GET    /api/notes?clientId=&dealId=
POST   /api/notes
DELETE /api/notes/:id
```

### Dashboard

```text
GET /api/dashboard/summary
GET /api/dashboard/pipeline
GET /api/dashboard/activity
```

## Permissions

Backend enforcement:

```text
ADMIN    Full access, user management
MANAGER  View all clients/deals, delete clients
SALES    Own clients, own deals, own tasks
```

Frontend enforcement:

```text
AuthGuard protects application routes.
RoleGuard protects /admin.
UI hides destructive/admin actions for roles without permission.
```

## Verification

The following verification has been run locally:

```bash
npm run prisma:generate --workspace backend
npm run db:migrate
npm run db:seed
npm run build
```

The seeded local smoke test logged in as `admin@clientcore.dev` and loaded `/api/dashboard/summary` successfully.

`npm run infra:up`, migration, and seed require Docker Desktop to be running. If Docker is not running, Compose reports that it cannot connect to `docker_engine`.
