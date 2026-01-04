# Standup App

A team standup application for tracking daily updates with calendar functionality and role-based access control.

## Prerequisites

- **Node.js 22.x** (required for better-sqlite3 compatibility)
- npm 10.x or higher

## Installation

```bash
# Clone the repository
git clone https://github.com/smartinsert/standup_app.git
cd standup_app

# Install dependencies
npm install

# Initialize the database (optional - auto-created on first run)
npm run reset-db
```

## Running

```bash
# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`

## Features

- Daily standup updates (Yesterday, Today, Blockers)
- Calendar view for past updates
- Team member management with regions
- Role-based access control (Admin/Member)
- Rich text editor for updates
- SQLite database for data persistence

## Tech Stack

- Next.js 16 (Turbopack)
- TypeScript
- SQLite (better-sqlite3)
- Vanilla CSS

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── context/          # React context providers
├── lib/              # Database configuration
└── types/            # TypeScript type definitions
```
