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
2. **Room Management**: RoomManager handles all room state (users, votes, tickets, host transfers, Jira settings)
3. **Real-time Updates**: All state changes broadcast to relevant room participants via Socket.IO
4. **Collaborative Tickets**: Any user can create, edit, and delete tickets; hosts manage room settings and voting

### Socket Events

Main events handled in server/src/index.ts:
- Room lifecycle: `createRoom`, `joinRoom`, `leaveRoom`
- Voting: `vote`, `votesUpdated`, `startVoting`, `revealVotes`, `resetVoting`, `finalizeEstimate`
- Ticket management: `createTask`, `updateTask`, `deleteTask`, `setCurrentTask`
- Host management: `transferHost`, `hostChanged`
- Jira integration: `updateJiraBaseUrl`, `jiraBaseUrlUpdated`

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
- **Card Animations**: Sequential card animations when voting starts (cards fan up from left to right)
- **Toast Notifications**: User-friendly error messages using react-toastify with dark theme

## Ticket Management Features

### Ticket Properties
- Ticket ID (required, e.g., PROJ-123) - primary identifier
- Description (optional) - context and details
- Status: pending, in_progress, completed
- Final estimate (set after voting completion)
- Creation timestamp

### User Capabilities
- **All Users**: Create, edit, and delete tickets (fully collaborative workflow)
- **Hosts Only**: Configure Jira base URL, manage voting sessions, set current ticket

### Jira Integration
- **Per-Room Configuration**: Each room has its own Jira base URL setting
- **Conditional Linking**: Ticket IDs become clickable links only when URL is configured
- **Auto-normalization**: URLs automatically get trailing slash if missing
- **Host-Only Settings**: Gear icon in ticket list for Jira configuration

### Ticket UI
- **Newest First**: New tickets appear at top of list
- **Always-Visible Controls**: Edit/delete buttons available to all users; play button for hosts only
- **Streamlined Form**: Just ticket ID (required) and description (optional)
- **Smart Linking**: Ticket titles become links when Jira URL is set, plain text otherwise
- **Clean Editing Experience**: Original ticket card hidden during editing for clutter-free UX
- **Empty Description Support**: Users can completely clear descriptions if desired

## Development Notes

- Monorepo structure using npm workspaces
- TypeScript throughout both client and server
- Real-time state synchronization via Socket.IO room broadcasting
- Automatic host reassignment when current host disconnects
- Room cleanup when last user leaves
- Font Awesome integration for consistent iconography
- Responsive three-column layout with proper overflow handling
- **React Router Integration**: Full URL-based navigation with shareable room links
- **Error Handling**: Toast notifications for invalid rooms with automatic redirect
- **Leave Room Fix**: Resolved race conditions and phantom user issues
- Don't ever run npm start, I will do that myself and test changes there
- You can run npm run build to check for build errors though
