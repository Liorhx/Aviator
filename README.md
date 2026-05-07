Aviator Game 🎮

A real-time multiplayer Aviator game built using Node.js, React, Socket.IO, MongoDB, Docker, and AWS EC2.

Players place bets before the round starts, watch the multiplier increase in real time, and cash out before the crash occurs. All players see the same multiplier simultaneously through WebSocket synchronization.

🚀 Live Demo
http://18.234.23.109:3000
📂 GitHub Repository
https://github.com/Liorhx/aviotor
🛠️ Tech Stack
Frontend
React.js
Vite
Socket.IO Client
CSS / Tailwind
Backend
Node.js
Express.js
Socket.IO
JWT Authentication
Database
MongoDB Atlas
Mongoose
DevOps & Deployment
Docker
Docker Compose
AWS EC2 (Ubuntu)
✨ Features
🎮 Game Features
Real-time Aviator gameplay
Live multiplier updates
Random crash logic
Bet placement system
Cash out functionality
Wallet balance management
Round history tracking
Live player bets panel
🔐 Authentication
JWT-based login/register
Protected routes
Authenticated socket connections
⚡ Real-Time Communication
WebSocket synchronization using Socket.IO
Same multiplier visible to all connected players
Instant crash & cashout events
☁️ Deployment
Dockerized full-stack application
Hosted on AWS EC2
MongoDB Atlas cloud database
🧠 Game Flow
WAITING → FLYING → CRASHED
Players place bets during WAITING phase
Round starts at 1.00x
Multiplier continuously increases
Players must cash out before crash
Server crashes at random multiplier
New round begins
📡 WebSocket Events
Client → Server
join_room { token }
place_bet { amount }
cash_out {}
Server → Client
round_waiting { countdown }
round_started { round_id }
multiplier_tick { value }
player_cashout { username, multiplier }
round_crashed { crash_at }
bet_result { profit, new_balance }
📁 Project Structure
aviotor/
│
├── Backend/
│ ├── config/
│ ├── routes/
│ ├── sockets/
│ ├── controllers/
│ └── models/
│
├── Frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ └── App.jsx
│
├── docker-compose.yml
├── dockerfile
├── package.json
└── README.md
⚙️ Environment Variables
Backend .env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=3000
Frontend .env
VITE_API_URL=http://localhost:3000
🐳 Docker Setup
Build & Run
docker compose up --build
Run in Background
docker compose up --build -d
☁️ AWS Deployment

The application is deployed on:

AWS EC2 (Ubuntu)
Docker containers
MongoDB Atlas cloud database
🔒 Security Features
JWT Authentication
Protected APIs
Secure WebSocket connections
Environment variable protection
MongoDB Atlas IP access control
🧪 Future Improvements
Redis scaling
Admin analytics dashboard
Provably fair crash verification
Kubernetes deployment
CI/CD pipeline
HTTPS + custom domain
Unit & integration tests
👨‍💻 Author

Rahul Yadav

📜 License

This project was built as a Full Stack Developer assignment and is intended for educational and portfolio purposes.
