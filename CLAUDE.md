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
- `App.tsx` - Main app component with header/lobby/room routing and layout
- `contexts/SocketContext.tsx` - Socket.IO connection management with reconnection logic
- `components/` - React components for different UI views:
  - `LobbyView.tsx` - Waiting room with integrated room list
  - `RoomView.tsx` - Main planning poker interface with three-column layout
  - `TaskList.tsx` - Task management sidebar with CRUD operations
  - `RoomList.tsx` - Active rooms display with create/join functionality
  - `ConnectionStatus.tsx` - Real-time connection indicator
  - `CardDeck.tsx` - Planning poker cards for voting
  - `UsernameInput.tsx` - Username entry modal

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

## UI Design System

### Icons
- Uses Font Awesome icons throughout the application for consistency
- Key icons: plus (create), edit, delete, play (select), clock (pending), spinner (in progress), check circle (completed)

### Layout
- **Room View**: Three-column grid layout (users | voting area | tasks)
- **Lobby**: Centered layout with title, connection status, and room list
- **Dark Theme**: Catppuccin-inspired color palette with `#1e1e2e` backgrounds and `#cdd6f4` text

### Interactive Elements
- Hover effects with `translateY(-1px)` transforms and shadows
- Consistent button styling with blue (`#89b4fa`) primary color
- Card-based design with rounded corners and subtle borders

## Task Management Features

### Task Properties
- Title (required), description (optional), Jira link (optional)
- Status: pending, in_progress, completed
- Final estimate (set after voting completion)
- Creation timestamp

### Host Capabilities
- Create, edit, and delete tasks
- Set current task for voting
- Update task status and final estimates
- Transfer host privileges to other users

### Task UI
- Integrated sidebar in room view
- Add button in header (matches room list pattern)
- Status icons with Font Awesome
- Hover actions for host (edit, delete, select)

## Development Notes

- Monorepo structure using npm workspaces
- TypeScript throughout both client and server
- Real-time state synchronization via Socket.IO room broadcasting
- Automatic host reassignment when current host disconnects
- Room cleanup when last user leaves
- Font Awesome integration for consistent iconography
- Responsive three-column layout with proper overflow handling