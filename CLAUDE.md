# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level (uses npm workspaces)
- `npm start` - Start both client and server in development mode
- `npm run build` - Build both client and server for production  
- `npm test` - Run tests for both workspaces

### Individual Services
- `npm run start:client` - Start React frontend (localhost:3000)
- `npm run start:server` - Start Node.js backend (localhost:3001)
- Client build: `npm run build --workspace=client`
- Server build: `npm run build --workspace=server`

### Testing
- Client tests: `npm run test --workspace=client`
- Server tests: `npm run test --workspace=server`

## Architecture Overview

This is a **real-time planning poker application** built with a React frontend and Node.js backend communicating via Socket.IO.

### Core Components

**Backend (server/src/)**
- `index.ts` - Main server entry point with Socket.IO event handlers
- `RoomManager.ts` - Core business logic for room/user/vote/task management
- Uses Express + Socket.IO with CORS for real-time communication

**Frontend (client/src/)**
- `App.tsx` - Main app component with routing between lobby and room views
- `contexts/SocketContext.tsx` - Socket.IO connection management with reconnection logic
- `components/` - React components for different UI views (LobbyView, RoomView, etc.)

### Key Data Flow

1. **Socket Connection**: SocketContext establishes WebSocket connection with automatic reconnection
2. **Room Management**: RoomManager handles all room state (users, votes, tasks, host transfers)
3. **Real-time Updates**: All state changes broadcast to relevant room participants via Socket.IO
4. **Host Privileges**: Only room hosts can create/modify tasks and transfer host status

### Socket Events

Main events handled in server/src/index.ts:
- Room lifecycle: `createRoom`, `joinRoom`, `leaveRoom`
- Voting: `vote`, `votesUpdated`
- Task management: `createTask`, `updateTask`, `deleteTask`, `setCurrentTask`
- Host management: `transferHost`, `hostChanged`

### Environment Setup

Client requires `.env` file with:
```
REACT_APP_SERVER_URL=http://localhost:3001
```

## Development Notes

- Monorepo structure using npm workspaces
- TypeScript throughout both client and server
- Real-time state synchronization via Socket.IO room broadcasting
- Automatic host reassignment when current host disconnects
- Room cleanup when last user leaves