# Connectly — Real-Time Video Conferencing Platform

**Full-Stack Video Calling App with WebRTC Peer-to-Peer Streams, Real-Time Chat, Screen Sharing, and Emoji Reactions**

> **Disclaimer:** This is an educational portfolio project built to demonstrate real-time communication concepts through a production-style video conferencing workflow.

---

## 📖 Project Overview

Connectly is a real-time video conferencing platform built from scratch using **WebRTC**, **Socket.IO**, **React**, and **Node.js** — the same technologies powering video communication at companies like Google Meet, Zoom, and Microsoft Teams.

When users need to connect face-to-face over the internet — for team standups, remote interviews, or catching up with friends — they join a shared meeting room. Connectly establishes **peer-to-peer media streams** between participants, routes **in-call chat messages** through a signaling server, and lets users **share their screen** or **react with emojis** — all in real time.

The system is built across four layers: a **WebRTC media engine** for peer-to-peer audio/video, a **Socket.IO signaling server** for connection negotiation and room management, a **REST API** for authentication and meeting history, and a **React frontend** with a lobby, in-call UI, chat panel, and participant list.

---

## ✨ Core Features

- **Peer-to-Peer Video Calls:** WebRTC establishes direct media streams between participants via STUN/ICE negotiation — video and audio never touch the server after the initial handshake.
- **Real-Time Chat:** In-call messaging via Socket.IO. Messages are broadcast to all participants in the room and persist for the duration of the session. Unread message count is tracked with a badge indicator.
- **Screen Sharing:** Share your screen with all participants using the `getDisplayMedia` API. When screen sharing stops, the video stream seamlessly reverts to the webcam feed.
- **Emoji Reactions:** Send live floating reactions (👍 🎉 ❤️ 😂 🔥 👏) that animate across every participant's screen with the sender's name — broadcast via Socket.IO to the entire room.
- **Participant List:** Live participant panel showing all connected users by name, with a "(You)" indicator for the local user.
- **Meeting Lobby:** Pre-join screen with a live camera preview. Users enter their display name before connecting to the room.
- **User Authentication:** Register and login with username/password. Passwords are hashed with bcrypt. Sessions use a random hex token stored in localStorage.
- **Meeting History:** Every joined meeting is logged to MongoDB. Users can view past meetings with date and meeting code, and rejoin with one click.
- **Guest Access:** Join a meeting without registering — enter directly from the landing page as a guest.
- **Copy Meeting Code:** One-click copy button in the call header lets users share the room code instantly.
- **Responsive Controls Bar:** Toggle camera, mic, screen share, reactions, participants panel, and chat — all with tooltip hints and active state indicators.
- **Graceful Disconnection:** When a user leaves, their peer connections are closed, their video tile is removed for all participants, and media tracks are stopped to release hardware.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS (React)                            │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Landing  │  │   Auth   │  │   Home   │  │ VideoMeet│               │
│  │  Page    │  │  Page    │  │  Page    │  │Component │               │
│  └──────────┘  └──────────┘  └──────────┘  └────┬─────┘               │
│                                                  │                     │
│         REST API (axios)                  WebRTC + Socket.IO           │
│              │                                   │                     │
└──────────────┼───────────────────────────────────┼─────────────────────┘
               │                                   │
               ▼                                   ▼
┌──────────────────────────────┐  ┌─────────────────────────────────────┐
│      Express REST API        │  │         Socket.IO Server            │
│                              │  │                                     │
│  POST /api/v1/users/login    │  │  Events:                           │
│  POST /api/v1/users/register │  │    • join-call     (enter room)    │
│  POST /add_to_activity       │  │    • signal        (SDP/ICE relay) │
│  GET  /get_all_activity      │  │    • chat-message  (broadcast msg) │
│                              │  │    • reaction      (emoji blast)   │
└──────────────┬───────────────┘  │    • user-joined   (new peer)      │
               │                  │    • user-left     (peer exited)   │
               ▼                  └─────────────────────────────────────┘
┌──────────────────────────────┐
│       MongoDB Atlas          │
│                              │
│  Collections:                │
│    • users  (name, username, │
│              password, token)│
│    • meetings (user_id,      │
│        meetingCode, date)    │
└──────────────────────────────┘
```

### WebRTC Call Flow

```
Caller                     Signaling Server (Socket.IO)              Callee
  │                                  │                                  │
  │── join-call ────────────────────►│                                  │
  │                                  │◄──────────────── join-call ──────│
  │                                  │                                  │
  │◄───── user-joined (clients) ─────│───── user-joined (clients) ─────►│
  │                                  │                                  │
  │── createOffer() ──┐              │                                  │
  │                   │              │                                  │
  │── signal (SDP offer) ──────────►│── signal (SDP offer) ───────────►│
  │                                  │                                  │
  │                                  │◄──── signal (SDP answer) ────────│
  │◄──── signal (SDP answer) ────────│                                  │
  │                                  │                                  │
  │◄────────────────── ICE candidates exchanged ──────────────────────►│
  │                                  │                                  │
  │◄═══════════════ Peer-to-Peer Media Stream ═══════════════════════►│
```

---

## 💻 Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express 5 | REST API framework |
| Socket.IO | Real-time signaling server for WebRTC + chat + reactions |
| Mongoose | MongoDB ODM for user and meeting models |
| bcrypt | Password hashing (10 salt rounds) |
| crypto | Random hex token generation for sessions |
| CORS | Cross-origin request handling |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| React Router v7 | Client-side routing (Landing → Auth → Home → VideoMeet → History) |
| Socket.IO Client | Real-time connection to signaling server |
| WebRTC APIs | `getUserMedia`, `getDisplayMedia`, `RTCPeerConnection` for media |
| MUI (Material UI) v9 | Icons, tooltips, badges, snackbars |
| Axios | HTTP client for REST API calls |
| CSS Modules | Scoped styling for the video conferencing UI |

### Database

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL database for users and meeting history |

### Infrastructure

| Technology | Purpose |
|---|---|
| Render | Backend hosting (Express + Socket.IO server) |
| Render | Frontend hosting (React SPA) |

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🖥️ Live App | [https://connectlyfrontend-ovva.onrender.com](https://connectlyfrontend-ovva.onrender.com) |
| 🔌 Backend API | [https://connectly-4v8i.onrender.com](https://connectly-4v8i.onrender.com) |

> **Note:** The backend is hosted on Render's free tier and may take ~30 seconds to cold-start on the first request.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account (or local MongoDB instance)

### 1. Clone the Repository

```bash
git clone https://github.com/pehel20/Connectly.git
cd Connectly
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

This starts the Express + Socket.IO server on **port 8000**.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm start
```

This starts the React dev server on **port 3000**.

### 4. Configure Environment

In `frontend/src/environment.js`, toggle between local and production:

```javascript
let IS_PROD = false;  // Set to false for local development
const server = IS_PROD ?
    "https://connectly-4v8i.onrender.com" :
    "http://localhost:8000"
```

### 5. Local Endpoints

| Endpoint | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |

---

## 📡 API Reference

### Register a User

```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pehel",
    "username": "pehel",
    "password": "securepassword"
  }'
```

**Response:**

```json
{ "message": "User Registered" }
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "pehel",
    "password": "securepassword"
  }'
```

**Response:**

```json
{ "token": "a1b2c3d4e5f6..." }
```

### Add Meeting to History

```bash
curl -X POST http://localhost:8000/api/v1/users/add_to_activity \
  -H "Content-Type: application/json" \
  -d '{
    "token": "a1b2c3d4e5f6...",
    "meeting_code": "abc123xy"
  }'
```

**Response:**

```json
{ "message": "Added code to history" }
```

### Get Meeting History

```bash
curl "http://localhost:8000/api/v1/users/get_all_activity?token=a1b2c3d4e5f6..."
```

**Response:**

```json
[
  {
    "_id": "...",
    "user_id": "pehel",
    "meetingCode": "abc123xy",
    "date": "2026-08-01T10:00:00.000Z"
  }
]
```

---

## 📁 Project Structure

```
Connectly/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Express + Socket.IO server entry point
│   │   ├── controllers/
│   │   │   ├── socketManager.js      # Socket.IO event handlers (signaling, chat, reactions)
│   │   │   └── user.controller.js    # Auth (login/register) + meeting history controllers
│   │   ├── models/
│   │   │   ├── user.model.js         # Mongoose User schema (name, username, password, token)
│   │   │   └── meeting.model.js      # Mongoose Meeting schema (user_id, meetingCode, date)
│   │   └── routes/
│   │       └── users.routes.js       # REST API route definitions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js                    # React Router setup (5 routes)
│   │   ├── App.css                   # Global styles (landing, auth, home, history, lobby)
│   │   ├── environment.js            # Backend URL config (prod/local toggle)
│   │   ├── pages/
│   │   │   ├── landing.jsx           # Landing page with hero section
│   │   │   ├── authentication.jsx    # Login/Register form with tab switching
│   │   │   ├── home.jsx              # Dashboard — join meeting, generate code, quick actions
│   │   │   ├── VideoMeet.jsx         # Core video call — WebRTC, chat, reactions, controls
│   │   │   └── history.jsx           # Meeting history list with rejoin buttons
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx       # Auth provider — login, register, history API calls
│   │   ├── utils/
│   │   │   └── withAuth.jsx          # HOC — redirects unauthenticated users to /auth
│   │   └── styles/
│   │       └── videoComponent.module.css  # CSS Modules for in-call UI
│   └── package.json
└── .gitignore
```

---

## 🧠 System Design Decisions

### Why WebRTC for media instead of routing through the server?

WebRTC establishes **direct peer-to-peer connections** between browsers. Audio and video data flows directly between participants without touching the server — reducing latency, cutting server bandwidth costs, and enabling HD quality. The server is only used for **signaling** (exchanging SDP offers/answers and ICE candidates via Socket.IO). This is the same architecture Google Meet uses for small group calls.

### Why Socket.IO for signaling instead of plain WebSockets?

Socket.IO provides **automatic reconnection**, **room management**, **event-based messaging**, and **fallback transports** out of the box. The `connections[path]` room pattern groups participants by meeting URL — when a user joins, only participants in that specific room are notified. Raw WebSockets would require building all of this manually.

### Why in-memory room state instead of Redis?

For an educational project at this scale, in-memory objects (`connections`, `messages`, `usernames`, `timeOnline`) are simpler and faster. Room state is inherently ephemeral — when a call ends, the data is no longer needed. Redis would only be necessary if the system needed to scale horizontally across multiple server instances.

### Why token-based auth instead of JWT?

The system uses a **random hex token** generated via `crypto.randomBytes(20)` and stored directly in the user document in MongoDB. This is simpler than JWT for a project where the only protected resources are meeting history endpoints. The token is stored in `localStorage` on the client and sent as a query parameter. For production, JWT with expiry and refresh tokens would be more appropriate.

### Why a Higher-Order Component (HOC) for route protection?

The `withAuth` HOC wraps protected pages (Home, History) and redirects unauthenticated users to `/auth`. This pattern keeps auth logic **decoupled from page components** — each page doesn't need to individually check for a token. The HOC checks `localStorage` for a token on mount and redirects if missing.

### Why STUN servers without TURN?

STUN (`stun:stun.l.google.com:19302`) is sufficient for most NAT traversal scenarios — it discovers the public IP and port mapping for each peer. TURN servers (which relay media through the server) are needed when both peers are behind symmetric NATs, but they are expensive to host. For a portfolio project, STUN covers the majority of connection scenarios.

---

## 📄 License

This project is for educational and portfolio purposes.
