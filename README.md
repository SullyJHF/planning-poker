# Planning Poker

A real-time planning poker web application built with React, TypeScript, Node.js, Express, and Socket.IO. Features comprehensive task management, private rooms, Docker deployment, and modern UI design.

## Features

- ✅ **Real-time Planning Poker** - Collaborative estimation with live vote tracking
- ✅ **Task Management System** - Complete CRUD operations with Jira integration
- ✅ **Private Rooms** - Password-protected rooms with host management
- ✅ **Username Caching** - Persistent username storage with URL parameter testing
- ✅ **Modern UI Design** - Dark theme with consistent component system
- ✅ **React Router Integration** - Shareable room links and URL-based navigation
- ✅ **Docker Deployment** - Production-ready containerization with environment management
- ✅ **Enhanced UX** - Toast notifications, keyboard shortcuts, and error handling

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js backend server
- `docker-compose.*.yml` - Docker deployment configurations
- `.env.*.example` - Environment configuration templates

## Prerequisites

### Development
- Node.js (v18 or higher)
- npm (v8 or higher)

### Docker Deployment
- Docker (v20 or higher)
- Docker Compose (v2 or higher)

## Quick Start (Development)

1. Install dependencies for both client and server:
```bash
npm install
```

2. Create a `.env` file in the client directory with:
```
REACT_APP_SERVER_URL=http://localhost:3001
```

3. Start both client and server in development mode:
```bash
npm start
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

## Docker Deployment

### Local Docker Testing

1. Copy and configure the local environment:
```bash
cp .env.local.example .env.local
# Edit .env.local - set LOCAL_HOST to your Docker host IP
```

2. Deploy locally with Docker:
```bash
./deploy.sh local
```

Access the application at the URL shown in the deployment output.

### Production Deployment

1. Copy and configure the production environment:
```bash
cp .env.production.example .env.production
# Edit .env.production with your domain and settings
```

2. Deploy to production with Traefik:
```bash
./deploy.sh deploy
```

### Environment Configuration

**Key Environment Variables:**
- `LOCAL_HOST`: Docker host IP for local deployment (localhost or machine IP)
- `DOMAIN`: Production domain for Traefik routing
- `CLIENT_URL/CORS_ORIGIN`: Application URLs for CORS configuration
- `HTTP_PROXY/HTTPS_PROXY/NO_PROXY`: Corporate network proxy support

### Docker Commands

```bash
# Local deployment
./deploy.sh local

# Production deployment  
./deploy.sh deploy

# View logs
./deploy.sh logs-local     # Local logs
./deploy.sh logs           # Production logs

# Stop services
./deploy.sh stop-local     # Stop local
./deploy.sh stop           # Stop production

# Restart services
./deploy.sh restart-local  # Restart local
./deploy.sh restart        # Restart production
```

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

## Architecture

### Backend (server/src/)
- `index.ts` - Main server entry point with Socket.IO event handlers
- `RoomManager.ts` - Core business logic for room/user/vote/task management
- Uses Express + Socket.IO with CORS for real-time communication

### Frontend (client/src/)
- `App.tsx` - Main app component with header/lobby/room routing and layout
- `contexts/SocketContext.tsx` - Socket.IO connection management with reconnection logic
- `components/` - React components for different UI views
- `utils/usernameStorage.ts` - Username persistence utility

### Docker Architecture
- **Client Container**: Multi-stage build (Node.js + nginx) for optimized React production build
- **Server Container**: Production Node.js runtime with health checks and security hardening
- **Networking**: Bridge networking for local, Traefik integration for production
- **Security**: Non-root users, proper CORS configuration, security headers via Traefik

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both development and Docker deployment
5. Submit a pull request

## License

MIT License - see LICENSE file for details 
