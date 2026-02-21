# Insider Online

A multiplayer online adaptation of the popular social deduction board game "Insider". 
Built as a modern web application within a Turborepo.

## 🚀 Features

- **Real-time Multiplayer:** Play live with your friends using WebSockets.
- **Role Assignment:** Automatically assigns Master, Insider, and Common roles.
- **Game Phases:** Managed phases for questions, discussion, and voting.
- **Responsive Design:** Playable on both desktop and mobile devices.

## 🛠 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Zustand
- **Backend:** NestJS, Socket.io
- **Database:** Prisma ORM, PostgreSQL
- **Monorepo:** Turborepo, pnpm

## 📦 Project Structure

```text
insider-online/
├── apps/
│   ├── web/       # Next.js frontend application
│   └── api/       # NestJS backend/websocket server
├── packages/
│   ├── database/  # Prisma schema and generated client
│   ├── config/    # Shared configuration (ESLint, TS, etc.)
│   └── types/     # Shared TypeScript types across apps
└── docker-compose.yml # For setting up local dependencies (like DB)
```

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- pnpm (v9+)
- Docker (for the database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/krizad/insider-online.git
   cd insider-online
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the local database using Docker:
   ```bash
   docker compose up -d
   ```

4. Set up environment variables:
   - Create `.env` files in `apps/web` and `apps/api` (use `.env.example` if available).
   - Ensure the `DATABASE_URL` in `packages/database/.env` points to your local Docker PostgreSQL instance.

5. Push the database schema:
   ```bash
   pnpm db:push
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```
   
   - Web App will run on `http://localhost:3000`
   - API Server will run on `http://localhost:3001` (or whichever port configured)

## 🚢 Deployment

1. Set up a Production PostgreSQL Database (e.g., Supabase, Neon).
2. Connect the GitHub repository to **Vercel** (for `apps/web`) and your preferred Node hosting for the API (e.g., Render, Railway).
3. Ensure you set the correct environment variables, specifically `DATABASE_URL` and `NEXT_PUBLIC_API_URL` (in the web app), to properly route the WebSocket connections to your deployed API.
