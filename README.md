# Cal.com Clone

A fullstack scheduling and booking application inspired by Cal.com.

## Tech Stack
- Frontend: React
- Backend: Node.js + Express
- Database: MySQL

## Repository Layout
- `backend/` - Express API and MySQL schema
- `frontend/` - React app placeholder to be implemented next

## Backend Status
- Express app scaffolded
- MySQL schema designed
- Seed data prepared
- Core feature routes and services added
- Bonus feature data models added

## Setup
1. Copy `.env.example` to `.env` and update the values.
2. Install dependencies inside `backend/`.
3. Create the MySQL database.
4. Run `backend/src/sql/schema.sql`.
5. Run `npm run seed --workspace backend`.
6. Start the backend with `npm run dev:backend`.

## Assumptions
- A default user with `id = 1` represents the logged-in admin.
- All bookings are stored in UTC.
- Availability schedules are timezone-aware.
- Email sending is logged to the database for now.
