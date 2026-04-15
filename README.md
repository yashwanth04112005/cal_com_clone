# Scheduling Platform (Cal.com Clone)

Full-stack scheduling and booking application inspired by Cal.com, built for the SDE intern fullstack assignment.

## Tech Stack
- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- Database: MySQL

## Assignment Coverage

### Core Features (Must Have)
1. Event Types Management
- Create event types with title, description, duration, and slug.
- Edit and delete event types.
- List and search event types in dashboard.
- Unique public booking link per event type.

2. Availability Settings
- Set available weekdays.
- Set available time windows per day.
- Set timezone per availability schedule.

3. Public Booking Page
- Calendar date selection.
- Slot availability based on selected schedule.
- Booking form with name and email.
- Double-booking prevention.
- Booking confirmation page with event details.

4. Bookings Dashboard
- View upcoming bookings.
- View past bookings.
- Cancel bookings.

### Bonus Features (Good To Have)
- Responsive design (desktop/tablet/mobile).
- Multiple availability schedules.
- Date overrides (block dates or custom hours).
- Rescheduling flow.
- Email notifications and email logs.
- Buffer time support.
- Custom booking questions.

## Additional UX Implemented
- Bookings list and calendar view toggle.
- Scope tabs: upcoming, unconfirmed, recurring, past, canceled.
- Working dropdowns (saved filters, rows per page).
- Profile dropdown with actions.

## Repository Layout
- backend/: Express API, SQL schema, services, validators
- frontend/: React SPA for admin and public booking flows

## Environment Setup

1. Copy environment file:

```bash
cp .env.example .env
```

2. Set required backend values in .env:
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME

3. Optional backend values:
- PORT (default 4000)
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- SMTP_FROM

4. Frontend runtime value (for deployed backend):
- VITE_API_BASE_URL

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Create DB and load schema
- Create database with name matching DB_NAME.
- Run SQL file:
  - backend/src/sql/schema.sql

### 3) Seed sample data

```bash
npm run seed --workspace backend
```

### 4) Run backend

```bash
npm run dev:backend
```

Backend default: http://localhost:4000

### 5) Run frontend

```bash
npm run dev --workspace frontend
```

Frontend default: http://localhost:5173

## Build

```bash
npm run build --workspace frontend
```

## Key API Routes
- Health: /health
- Event types: /api/event-types
- Availability: /api/availability/schedules
- Bookings dashboard: /api/bookings
- Public event/slots/booking:
  - /api/public/event-types/:slug
  - /api/public/event-types/:slug/slots
  - /api/public/event-types/:slug/bookings
- Public profile event types: /api/public/profiles/:username/event-types

## Deployment Guide

### Backend (Railway recommended)

1. Create a new Railway project from this repo.
2. Set root directory to backend.
3. Build command:

```bash
npm install
```

4. Start command:

```bash
npm run start
```

5. Add production environment variables:
- NODE_ENV=production
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- SMTP_* (optional)

6. Provision MySQL (Railway MySQL or external MySQL).
7. Run schema and optional seed on production DB:
- backend/src/sql/schema.sql
- backend/src/sql/seed.sql

### Frontend (Vercel recommended)

1. Import repo in Vercel.
2. Set root directory to frontend.
3. Framework preset: Vite.
4. Build command:

```bash
npm run build
```

5. Output directory: dist
6. Add env var:
- VITE_API_BASE_URL=https://your-backend-domain

7. Deploy.

Note: SPA route rewrites are configured in frontend/vercel.json.

## Post-Deploy Checklist

1. Verify backend health endpoint.
2. Open frontend and test event types dashboard.
3. Create a public booking and confirm it appears in bookings dashboard.
4. Cancel and reschedule one booking.
5. Verify email log rows in email_logs table (if SMTP configured).

## Known Notes
- Admin side currently assumes a default logged-in user (seed user id = 1).
- Booking timestamps are persisted in UTC.
- If backend fails locally with EADDRINUSE, port 4000 is already occupied by another process.

## Submission Links
- GitHub Repository: add your public repo URL
- Live Frontend URL: add deployed frontend URL
- Live Backend URL: add deployed backend URL
