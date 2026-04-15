# Scheduling Platform (Cal.com Clone)

Fullstack scheduling and booking application inspired by Cal.com, built for SDE intern fullstack assignment requirements.

## Tech Stack
- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Database: MySQL

## Features Implemented

### Core Features
- Event Types Management
	- Create event types (title, description, duration, slug)
	- Edit existing event types
	- Delete existing event types
	- List and search event types on dashboard
	- Public link per event type
- Availability Settings
	- Multiple schedules
	- Create schedule with timezone and default flag
	- Edit schedule name and timezone
	- Set default schedule
	- Configure per-day availability windows
	- Delete schedules
- Public Booking Page
	- Calendar date selection
	- Dynamic available slots based on schedule
	- Booking form (name, email, custom answers)
	- Double-booking prevention
	- Booking confirmation page
- Bookings Dashboard
	- Upcoming bookings
	- Past bookings
	- Cancel booking

### Bonus Features
- Multiple availability schedules
- Date overrides schema + backend support
- Rescheduling flow
- Email notification service/logging
- Buffer time support
- Custom booking questions

## Repository Layout
- `backend/` - Express API, schema, services, validators
- `frontend/` - React SPA (admin + public booking flows)

## Environment Setup
1. Copy `.env.example` to `.env` at repository root.
2. Update DB credentials in `.env`.

Required values:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Optional values:
- `PORT` (default `4000`)
- `SMTP_*` for email delivery

Frontend optional:
- `VITE_API_BASE_URL` (for deployed backend URL)

## Local Setup

### 1. Install dependencies
From repository root:

```bash
npm install
```

### 2. Prepare MySQL database
- Create database specified by `DB_NAME`.
- Run schema:
	- `backend/src/sql/schema.sql`
- Seed sample data:

```bash
npm run seed --workspace backend
```

### 3. Run backend

```bash
npm run dev:backend
```

Backend runs on `http://localhost:4000` by default.

### 4. Run frontend

```bash
npm run dev --workspace frontend
```

Frontend runs on Vite default port (usually `http://localhost:5173`).

## Build Commands
- Frontend production build:

```bash
npm run build --workspace frontend
```

## API Overview
- Event types: `/api/event-types`
- Availability: `/api/availability/schedules`
- Bookings: `/api/bookings`
- Public booking: `/api/public/event-types/:slug`
- Public profile event types: `/api/public/profiles/:username/event-types`

## Deployment
- GitHub Repository: add your public repo URL here
- Live Frontend URL: add deployed frontend URL here
- Live Backend URL: add deployed backend URL here

If backend is deployed separately, set `VITE_API_BASE_URL` in frontend deployment environment.

## Assumptions
- Admin side uses a default logged-in user (seeded user `id = 1`).
- Booking timestamps are stored in UTC.
- Availability schedules are timezone-aware.
- SMTP can be configured for real email delivery; otherwise email workflow is still logged by backend.
