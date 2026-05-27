# ClientCore CRM

## Live Demo

**Frontend:** https://client-core-crm-frontend.vercel.app  
**API:** https://clientcore-crm-production.up.railway.app/api/health

> Login with `admin@clientcore.dev` / `Password123!` to explore the full app.

> Full-stack CRM for managing clients, deals, tasks, and sales pipelines — built with Angular 17, Node.js, Express, Prisma, and PostgreSQL.

![Dashboard](docs/screenshots/dashboard.png)

## Features

- **JWT Authentication** with access + refresh tokens and role-based guards
- **Role system** — ADMIN / MANAGER / SALES with enforced permissions on backend and frontend
- **Client management** — searchable list, contacts, deals, and notes per client
- **Sales pipeline** — Kanban board with deal cards across 6 stages (Lead → Won/Lost)
- **Task tracker** — priority, status, due dates, linked to clients or deals
- **Admin panel** — user creation, role assignment, and account deactivation
- **Dashboard** — KPI cards, pipeline value by stage, recent activity feed

## Screenshots

| Clients | Pipeline |
|---|---|
| ![Clients](docs/screenshots/clients.png) | ![Pipeline](docs/screenshots/pipeline.png) |

| Tasks | Admin |
|---|---|
| ![Tasks](docs/screenshots/tasks.png) | ![Admin](docs/screenshots/admin.png) |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17+ (standalone components, signals, Reactive Forms) |
| Backend | Node.js + Express (modular router→controller→service→repository) |
| Database | PostgreSQL |
| ORM | Prisma (migrations + seed) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Styles | SCSS |

## Architecture
clientcore/
├── backend/
│   ├── prisma/          # schema, migrations, seed
│   └── src/
│       ├── config/
│       ├── middlewares/ # auth, roles, error handler
│       └── modules/     # auth, users, clients, contacts, deals, tasks, notes, dashboard
├── frontend/
│   └── src/app/
│       ├── core/        # guards, interceptors, services
│       ├── shared/      # reusable components, pipes
│       ├── features/    # auth, dashboard, clients, deals, tasks, admin
│       └── layout/      # sidebar, navbar, shell

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Steps

```bash
git clone https://github.com/joakiorlandoprados-sudo/ClientCore-CRM.git
cd ClientCore-CRM
npm install
```

Create `backend/.env` from the example:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/clientcore"
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
```

Create the database and run migrations:

```bash
# In psql or pgAdmin: CREATE DATABASE clientcore;
npm run db:migrate
npm run db:seed
```

Start backend and frontend:

```bash
npm run dev:backend   # http://localhost:3000/api/health
npm run dev:frontend  # http://localhost:4200
```

## Seed Credentials

All seed users share the password `Password123!`

| Email | Role |
|---|---|
| admin@clientcore.dev | ADMIN |
| manager1@clientcore.dev | MANAGER |
| sales1@clientcore.dev | SALES |

## API

REST API with consistent response shape:

```json
{ "success": true, "data": {}, "message": "optional" }
```

Key endpoints: `/api/auth`, `/api/clients`, `/api/deals`, `/api/tasks`, `/api/notes`, `/api/dashboard`

## Permissions

| Action | ADMIN | MANAGER | SALES |
|---|---|---|---|
| Manage users | ✅ | ❌ | ❌ |
| View all clients | ✅ | ✅ | ❌ |
| View own clients | ✅ | ✅ | ✅ |
| Delete clients | ✅ | ✅ | ❌ |
| View all deals | ✅ | ✅ | ❌ |
| Manage own deals | ✅ | ✅ | ✅ |