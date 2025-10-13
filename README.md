# VConnect
VConnect is a full-stack video conferencing application that enables users to connect via real-time video, audio, chat, and screen sharing — all powered by WebRTC and Socket.IO.It features room-based architecture, low-latency peer-to-peer communication, and a responsive, mobile-first UI built with React.js and Tailwind CSS.

# Features
> Real-Time Communication – Video and audio streaming using WebRTC with STUN/TURN configuration for peer-to-peer connections.
> Instant Chat – Live in-room messaging powered by Socket.IO events.
> Screen Sharing – Share your screen seamlessly during active calls.
> Room-Based Architecture – Dynamic room creation and user management for scalable sessions.
> Low-Latency Signaling – Optimized Socket.IO signaling for stable and fast communication.
> Responsive UI – Built with React.js and Tailwind CSS for a clean, intuitive, mobile-first experience.
> Backend Integration – Node.js + Express server handles signaling, room management, and socket orchestration.
> Persistent Data – MongoDB stores session and user details efficiently.

# Tech Stack
### Frontend
> React.js
> Tailwind CSS
> WebRTC
### Backend
> Node.js
> Express.js
> Socket.IO
### Database
> MongoDB

# Architecture Overview
VConnect uses a room based signaling system - 
> A user can join or create a room with their unique room Id.
> Socket.IO handles real-time signaling events (join, leave, offer, answer)
> WebRTC establishes direct peer-to-peer connection for media exchange
> The backend ensures stability and manages room membership dynamically.

# How It Works
## Frontend (React)
Prompts users for camera and microphone access.
Connects to the signaling server via Socket.IO.
Renders video elements dynamically as users join or leave.
## Backend (Express + Socket.IO)
Handles signaling messages (offer, answer, candidate).
Manages room states and broadcasts user connection events.
## Database (MongoDB)
Stores user sessions, meeting history, and logs.

# Set-Up Instructions
> Clone the repository
> Install dependancies
> Create a .env file in the server directory
> Run the app - "npm start" for frontend and "npm run dev" for backend

# Demo

### Landing Page
<img width="1899" height="867" alt="image" src="https://github.com/user-attachments/assets/0940927d-67e2-4a51-8b8c-61adee9802e3" />

### Auth Page
<img width="1902" height="865" alt="image" src="https://github.com/user-attachments/assets/fedbeac2-c10d-4b77-93b2-d1344a7ed13d" />

### Home Page
<img width="1915" height="863" alt="image" src="https://github.com/user-attachments/assets/871c8998-eb52-4fd4-84a0-a1e8dea6ae6f" />

### Video Component
<img width="1897" height="856" alt="Screenshot 2025-10-13 154607" src="https://github.com/user-attachments/assets/d98325d8-b8d7-4c3c-9590-dc6f9e347e83" />

Contributions, issues, and feature requests are welcome!
Feel free to fork the repo and submit a pull request.

# Developer

### Sakshi Kulkarni




