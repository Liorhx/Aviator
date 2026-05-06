# Aviator: Real-Time Multiplayer Crash Game

A high-performance, real-time multiplayer game built with the MERN stack (MySQL, Express, React, Node.js + Socket.IO).

## 🔥 Features

- **Real-time Synchronization**: All players see the exact same multiplier tick and crash event.
- **Provably Fair**: Crash points are generated using HMAC-SHA256 with a transparent seeding system.
- **Wallet System**: Automatic balance deduction and profit addition on cashout.
- **Live Leaderboard**: Real-time updates showing bets and cashouts from other players.
- **History Tracking**: Last 10 round results with color-coding based on multiplier magnitude.
- **Responsive UI**: Optimized for desktop and mobile with sleek animations.

## 🚀 Tech Stack

### Frontend
- **React (Vite)**: Modern SPA framework.
- **Redux Toolkit**: Centralized state for auth and game data.
- **Framer Motion**: Smooth aircraft animations and multiplier transitions.
- **Tailwind CSS**: Utility-first styling for a technical, dark-mode aesthetic.
- **Socket.io-client**: Real-time event consumption.

### Backend
- **Node.js & Express**: API and middleware.
- **Socket.io**: Persistent WebSocket connections with JWT auth.
- **Sequelize ORM**: Database modeling and migrations.
- **JWT**: Secure user authentication.
- **Crypto (Node.js)**: Provably fair random logic.

## 🛠️ Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file from `.env.example`:
   ```env
   JWT_SECRET="your_secret_key"
   NODE_ENV="development"
   PORT=3000
   ```

3. **Run in Development**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## ☁️ AWS Deployment Guide

### 1. EC2 Backend Setup
- Launch an EC2 instance (Ubuntu 22.04).
- Install Node.js, Docker, and Nginx.
- Clone the repository.
- Use **PM2** to manage the Node.js process: `pm2 start server.ts --interpreter tsx`.

### 2. RDS (MySQL)
- Create a MySQL RDS instance.
- Update `server/config/database.ts` to use `mysql2` dialect and provide RDS credentials.

### 3. S3 & CloudFront (Optional for Static Assets)
- For extreme scale, build the frontend (`npm run build`) and upload `dist/` to an S3 bucket configured for static hosting.
- Set up CloudFront with the S3 bucket as origin.

### 4. Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🔐 Provably Fair Calculation

1. A `server_seed` is generated on round start.
2. An `id` is assigned to the round.
3. `HashedValue = hmac_sha256(server_seed, id)`.
4. The first 8 characters of the hash are converted to a decimal `X` (0 to 1).
5. `CrashPoint = 0.99 / (1 - X)`.
6. This ensures the house only has a 1% edge and the outcome is predetermined and verifiable.

## 📡 WebSocket Events

### Client -> Server
- `join_room { token }`: Authenticate and join the game room.
- `place_bet { amount }`: Place a bet for the next round.
- `cash_out {}`: Cash out at the current multiplier.

### Server -> Client
- `round_waiting { countdown }`: Countdown to the next flight.
- `round_started { round_id }`: Airplane takes off.
- `multiplier_tick { multiplier }`: Current multiplier value.
- `round_crashed { crash_at }`: Game over event.
- `player_bet { username, amount }`: Notify others of a new bet.
- `player_cashout { username, multiplier, profit }`: Notify others of a win.
