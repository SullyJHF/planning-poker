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

## Development Practices

- Always update the package.json version number sensibly before making git commits

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
  - `RoomList.tsx` - Active rooms display with create/join functionality and private room creation
  - `RoomSettings.tsx` - Comprehensive settings modal for hosts (Jira + password management)
  - `ConnectionStatus.tsx` - Real-time connection indicator
  - `CardDeck.tsx` - Planning poker cards for voting
  - `UsernameInput.tsx` - Username entry modal
  - `routes/RoomRoute.tsx` - Room URL routing with password validation for private rooms
- `utils/usernameStorage.ts` - Username persistence utility with localStorage and URL parameter support

### Key Data Flow

1. **Socket Connection**: SocketContext establishes WebSocket connection with automatic reconnection
2. **Room Management**: RoomManager handles all room state (users, votes, tickets, host transfers, Jira settings)
3. **Real-time Updates**: All state changes broadcast to relevant room participants via Socket.IO
4. **Collaborative Tickets**: Any user can create, edit, and delete tickets; hosts manage room settings and voting

### Socket Events

Main events handled in server/src/index.ts:
- Room lifecycle: `createRoom`, `joinRoom`, `leaveRoom`, `checkRoomExists`
- Private rooms: `validateRoomPassword`, `updateRoomPassword`
- Voting: `vote`, `votesUpdated`, `startVoting`, `revealVotes`, `resetVoting`, `finalizeEstimate`
- Ticket management: `createTask`, `updateTask`, `deleteTask`, `setCurrentTask`
- Host management: `transferHost`, `hostChanged`
- Jira integration: `updateJiraBaseUrl`, `jiraBaseUrlUpdated`

### Version Information System

**VersionInfo Component:**
- Click-based modal displaying build information in app header
- Automatic version extraction from package.json during build process
- Environment variables injected at Docker build time for production deployments

**Build Information Displayed:**
- Application version from package.json (e.g., "Planning Poker v1.2.0")
- Git commit hash (shortened to 7 characters, e.g., "54f38b0")
- Git branch name (e.g., "main")
- Build timestamp in ISO format
- Environment indicator (Production/Development)

**Version Injection Process:**
- GitHub Actions extracts version from package.json and git context
- Variables passed to VPS deployment via environment exports
- Docker containers receive version info via build arguments
- React app accesses via process.env.REACT_APP_* variables

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
- **Host-Only Settings**: Gear icon in room header for Jira configuration

### Private Rooms
- **Password Protection**: Rooms can be created as private with password requirements
- **Server-side Filtering**: Private rooms filtered from public room lists automatically
- **Direct URL Access**: Private rooms accessible via direct links with password validation
- **Host Password Management**: Comprehensive settings modal for viewing/modifying passwords
- **Copy Link Feature**: Room ID button in header copies shareable room URL to clipboard
- **Real-time Updates**: Password changes broadcast immediately to all room participants
- **Security**: Server-side password validation prevents unauthorized access

### Username Persistence
- **Automatic Caching**: Usernames saved to localStorage and restored on page refresh
- **URL Parameter Override**: Testing support with `?username=TestUser` for multi-user development
- **Smart Cache Logic**: URL parameters don't override saved cache (preserves normal UX)
- **Clear Username**: "Change" button properly clears both state and localStorage
- **Error Handling**: Graceful fallback if localStorage is disabled or unavailable
- **Zero UI Impact**: No visual changes between development and production builds

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
- **Username Caching**: Usernames automatically saved to localStorage for persistence
- **Testing Support**: Use URL parameter `?username=TestUser` to override cached username for multi-user testing
- **Consistent UI Design System**: Unified Button and IconButton components with centralized styling
- **Reusable Components**: AppHeader and UsernameDisplay components for consistency across views
- **Enhanced UX**: Keyboard shortcuts, better error handling, and improved toast positioning
- **Host Privileges**: Room hosts bypass password requirements for their own private rooms
- **CI/CD Integration**: Full GitHub Actions workflow for automated deployment to production VPS
- **Version Display**: Automatic build information display with version modal in app header
- **Local Testing Support**: Use `act` tool for testing GitHub Actions workflows locally
- **Deployment Documentation**: Comprehensive DEPLOYMENT.md with setup and troubleshooting guides
- Don't ever run npm start, I will do that myself and test changes there
- You can run npm run build to check for build errors though
- **Always ask before committing any code**

## Deployment & CI/CD

### GitHub Actions CI/CD Pipeline
The application features a comprehensive automated deployment system:

**Automated Deployment:**
- Triggers on pushes to `main` branch (including PR merges)
- Full CI/CD pipeline with build verification and container deployment
- SSH-based deployment to VPS with comprehensive error handling
- Automatic version injection from package.json and git context

**Manual Deployment:**
- Workflow dispatch with environment selection (production/staging)
- Local testing capabilities using `act` tool
- Rollback safety with git history maintenance

**Key Features:**
- Pre-deployment dependency installation and application building
- Container verification after deployment
- Comprehensive logging and error reporting
- Secure SSH key management via GitHub Secrets
- Environment-specific deployment configurations

**Required GitHub Secrets:**
- `VPS_HOST`: Server IP or hostname
- `VPS_USER`: SSH username (typically `deployer`)
- `VPS_SSH_KEY`: Private SSH key for authentication
- `VPS_PORT`: SSH port (optional, defaults to 22)

**Local Testing:**
- Use `act` tool to test workflows locally before pushing
- Create `.secrets` file for local testing credentials
- Dry-run capabilities for workflow validation

### Docker Deployment

#### Environment Configuration
The application supports both local and production Docker deployments with environment variable management:

**Local Deployment:**
- Use `./deploy.sh local` for local Docker testing
- Configuration via `.env.local` file (copied from `.env.local.example`)
- Set `LOCAL_HOST` to your Docker host IP (localhost for standard setups, machine IP for corporate networks)
- Supports VPN/proxy environments with HTTP_PROXY configuration

**Production Deployment:**
- Use `./deploy.sh deploy` for production deployment with Traefik
- Configuration via `.env.production` file (copied from `.env.production.example`)
- Requires domain configuration and Traefik integration
- SSL/TLS certificate management via Let's Encrypt

**Key Environment Variables:**
- `LOCAL_HOST`: Docker host IP for local deployment (e.g., localhost or 172.30.193.32)
- `DOMAIN`: Production domain for Traefik routing
- `CLIENT_URL/CORS_ORIGIN`: Application URLs for CORS configuration
- `HTTP_PROXY/HTTPS_PROXY/NO_PROXY`: Corporate network proxy support

### Docker Architecture
- **Client Container**: Multi-stage build (Node.js + nginx) for optimized React production build
- **Server Container**: Production Node.js runtime with health checks and security hardening
- **Networking**: Bridge networking for local, Traefik integration for production
- **Security**: Non-root users, proper CORS configuration, security headers via Traefik

## UI Component System

### Button Components
The application uses a consistent button system with two main components:

**Button Component (`Button.tsx`)**
- **Variants**: `primary`, `secondary`, `danger`, `success`, `outline`, `ghost`
- **Sizes**: `small`, `medium`, `large`
- **Features**: Icon support, consistent styling, hover effects, disabled states
- **Usage**: For text buttons with optional icons

**IconButton Component (`IconButton.tsx`)**
- **Variants**: `primary`, `secondary`, `danger`, `success`, `warning`, `outline`, `ghost`
- **Sizes**: `small` (24px), `medium` (32px), `large` (40px)
- **Features**: Perfect circles, scale hover effects, consistent icon sizing
- **Usage**: For icon-only buttons (add, edit, delete, etc.)

### Reusable Components
**UsernameDisplay Component (`UsernameDisplay.tsx`)**
- **Variants**: `header` (default), `compact` (for lobby)
- **Features**: Consistent username display with change button across all views

**AppHeader Component (`AppHeader.tsx`)**
- **Variants**: `lobby`, `room`
- **Features**: Unified header experience with flexible right content
- **Lobby**: Clean header without background, centered content
- **Room**: Structured header with three-column layout

### Local Testing with Multiple Users

For testing multiple users locally:
1. **Primary user**: Use normal tab (will use cached username)
2. **Additional users**: Add `?username=Alice` to URL for different usernames  
3. **Alternative**: Use incognito windows (each has separate localStorage)
4. **Username override**: `http://localhost:3000/room/abc123?username=TestUser`