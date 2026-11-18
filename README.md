# JANSETU — Citizen Complaint Prioritization & Resolution Platform

> Bridging Citizens. Building Solutions.

A full-stack civic grievance management platform built for the Smart City & Urban Development hackathon.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Maps | Leaflet + OpenStreetMap |
| Charts | Recharts |
| Images | Cloudinary (production) / local disk (dev) |

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### Setup

```bash
# 1. Install all dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure server environment
cd server
cp .env.example .env
# Edit .env — the defaults work for local dev

# 3. Seed demo data
npm run seed

# 4. Start the backend (Terminal 1)
npm run dev

# 5. Start the frontend (Terminal 2)
cd ../client
npm run dev
```

App runs at: http://localhost:5173

### Demo Accounts (all use `Password@123`)

| Role | Email |
|---|---|
| Admin | admin@jansetu.gov.in |
| Official (Roads) | official.roads@jansetu.gov.in |
| Official (Water) | official.water@jansetu.gov.in |
| Official (Sanitation) | official.sanitation@jansetu.gov.in |
| Citizen 1 | citizen1@jansetu.org |
| Citizen 2 | citizen2@jansetu.org |

---

## Deployment Guide (Render + MongoDB Atlas)

### Step 1 — MongoDB Atlas
1. Create free account at https://cloud.mongodb.com
2. Create a new cluster (free M0 tier)
3. Create a database user with password
4. Whitelist `0.0.0.0/0` in Network Access
5. Copy the connection string — looks like:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jansetu?retryWrites=true&w=majority`

### Step 2 — Cloudinary
1. Create free account at https://cloudinary.com
2. Go to Dashboard → copy Cloud Name, API Key, API Secret

### Step 3 — Deploy Backend on Render
1. Push your code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add these Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your Atlas URI>
   JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   CLIENT_URL=https://<your-frontend-url>.onrender.com
   CLOUDINARY_CLOUD_NAME=<from cloudinary dashboard>
   CLOUDINARY_API_KEY=<from cloudinary dashboard>
   CLOUDINARY_API_SECRET=<from cloudinary dashboard>
   ```
6. Deploy — note the backend URL (e.g. `https://jansetu-api.onrender.com`)

### Step 4 — Deploy Frontend on Render
1. New → Static Site
2. Connect same repo
3. Set:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://jansetu-api.onrender.com/api
   ```
5. Deploy

### Step 5 — Seed Production Data (optional)
After backend is live, run seed locally pointing to Atlas:
```bash
cd server
MONGODB_URI="<your Atlas URI>" node utils/seed.js
```

---

## Project Structure

```
JANSETU/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # All page components
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth + Notification context
│   │   ├── layouts/        # Dashboard + Public layouts
│   │   └── services/api.js # Axios instance
│   └── vite.config.js
└── server/                 # Express backend
    ├── config/             # DB + Cloudinary config
    ├── controllers/        # Route handlers
    ├── middleware/         # Auth + Upload middleware
    ├── models/             # Mongoose schemas
    ├── routes/             # Express routers
    ├── services/           # Notification service
    └── utils/              # Priority engine, ID generator, seed, deadline checker
```

---

## Features

- **Rule-based priority engine** — transparent scoring (severity + public institution + age)
- **Deadline-based escalation** — background checker flags overdue complaints every 5 minutes
- **Citizen-verified resolutions** — departments submit photo evidence, citizens confirm
- **Public accountability dashboard** — live charts from real database data
- **Role-based access** — citizen / department official / admin
- **In-app notifications** — real-time alerts on status changes

---

*JANSETU — Smart City & Urban Development | Hackathon 2026*
