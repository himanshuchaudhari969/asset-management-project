# Asset Management Platform

A full-stack web app to manage shared assets and bookings. Built for Cult Open Projects 2026 — IIT Roorkee Cultural Council.

## Live Demo

- Frontend: https://asset-management-project-71ed.vercel.app/
- Backend: https://asset-management-project-bmlf.onrender.com

-## Demo video 

https://drive.google.com/file/d/1_6dx9hUW1z1cTT1zLF1BNIuGPyvU2h16/view?usp=drive_link

## What it does

Organizations like IIT Roorkee's Cultural Council manage a lot of shared equipment — cameras, audio systems, stage props etc. This platform makes it easier to track who has what, when it's due back, and how often things are being used.

## Tech Stack

- **Backend** — Node.js, Express, PostgreSQL, JWT
- **Frontend** — React, Axios, Recharts, React Router

## Features

- Register/Login with role-based access (Admin & User)
- Admins can add, edit, delete assets
- Users can search assets and raise booking requests
- Admins approve, reject, or mark assets as returned
- Analytics dashboard with charts (utilization, booking trends, status distribution)
- In-app notifications when booking status changes
- Audit logs for all admin actions
- QR code generation for each asset

## Setup

### Requirements
- Node.js, PostgreSQL, npm

### Steps

```bash
# Clone the repo
git clone https://github.com/himanshuchaudhari969/asset-management-project.git
cd asset-management-project

# Backend setup
cd backend
npm install
node db.setup.js
node server.js

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

### .env format (inside backend folder)


DB_HOST=localhost
DB_PORT=5432
DB_NAME=asset_management
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_secret
PORT=5000


App runs locally at `http://localhost:3000`

For live demo visit: https://asset-management-project-71ed.vercel.app/

## API Overview

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/assets | Get all assets | Protected |
| POST | /api/assets | Create asset | Admin |
| PUT | /api/assets/:id | Update asset | Admin |
| DELETE | /api/assets/:id | Delete asset | Admin |
| POST | /api/bookings | Create booking | Protected |
| GET | /api/bookings/my | My bookings | Protected |
| GET | /api/bookings/all | All bookings | Admin |
| PUT | /api/bookings/:id/status | Update status | Admin |
| GET | /api/analytics | Analytics data | Admin |
| GET | /api/notifications | Notifications | Protected |
| PUT | /api/notifications/read | Mark read | Protected |
| GET | /api/audit | Audit logs | Admin |
