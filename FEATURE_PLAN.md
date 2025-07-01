# Planning Poker Feature Enhancement Plan

## Current State Analysis
The application currently supports:
- Real-time room creation and joining
- Planning poker voting with standard card values (0, 1, 2, 3, 5, 8, 13, ?, ∞)
- Host management and transfer
- Username management
- Live vote tracking
- **✅ Task/Story Management System** - Complete with CRUD operations, status tracking, and Jira integration
- **✅ Font Awesome Icon System** - Consistent iconography throughout the application
- **✅ Dark Theme UI** - Modern three-column layout with Catppuccin-inspired design
- **✅ Estimation Session Management** - Complete voting workflow with phases, vote hiding, and result calculations
- **✅ Ticket-Centric Workflow** - Streamlined ticket ID-based task management with conditional Jira linking
- **✅ Per-Room Jira Integration** - Host-configurable Jira base URLs with automatic link generation
- **✅ React Router Integration** - URL-based navigation with shareable room links and username persistence
- **✅ Card Animation System** - Engaging visual feedback during voting phases
- **✅ Error Handling** - Toast notifications and graceful error recovery
- **✅ Private Rooms with Password Protection** - Password-protected private rooms with host management
- **✅ Local Username Caching** - Persistent username storage with URL parameter testing support
- **✅ Consistent UI Design System** - Unified button components and header system throughout application
- **✅ Enhanced UX Improvements** - Better error handling, keyboard shortcuts, and toast notifications
- **✅ Docker Production Deployment** - Complete containerized deployment with environment variable management

**🎯 NEXT: Enhanced Voting System** - Custom card decks and vote confidence tracking

## Proposed Feature Enhancements

### 1. ✅ Task/Story Management System - COMPLETED
**Priority: High**
~~**Current Issue**: Users can only estimate one implicit task - there's no way to define what they're estimating.~~

**✅ Completed Features:**
- **✅ Ticket Creation**: Any user can create, edit, and delete tickets (collaborative management)
- **✅ Ticket Details**: Each ticket includes:
  - Ticket ID (required, e.g., PROJ-123)
  - Description (optional, used for context/details)
  - Status (pending, in_progress, completed)
  - Final estimate (set after voting)
- **✅ Ticket Navigation**: 
  - Current ticket indicator with highlighted styling
  - Ticket selection via play button
  - Ticket list sidebar with Font Awesome icons
  - Newest tickets appear at top of list
- **✅ Ticket States**: 
  - Pending (⏰ clock icon)
  - In Progress (🔄 spinning icon)
  - Completed (✅ check circle icon)
- **✅ Per-Room Jira Integration**:
  - Host-only configurable Jira base URL settings
  - Conditional linking (no links until URL is set)
  - Automatic URL normalization (trailing slash)
  - Auto-focus and text selection in settings
  - Ticket IDs become clickable links when Jira URL configured

**✅ Implementation Completed:**
- ✅ Extended Room interface to include tickets array and jiraBaseUrl
- ✅ Added TaskList.tsx component with streamlined ticket-focused UI
- ✅ Added socket events: createTask, updateTask, deleteTask, setCurrentTask, updateJiraBaseUrl
- ✅ Implemented ticket state management in RoomManager with per-room Jira settings
- ✅ Simplified data model (removed title field, ticket ID is primary identifier)
- ✅ Enhanced UI with always-visible edit/delete controls for all users
- ✅ Collaborative task management - any room member can edit/delete tasks
- ✅ Clean editing experience with hidden original cards during editing
- ✅ Proper empty description handling for task clearing

### 2. ✅ Local Username Caching - COMPLETED
**Priority: High**
~~**Current Issue**: Users must re-enter their username every time they visit the application.~~

**✅ Completed Features:**
- **✅ Persistent Username Storage**: Usernames automatically saved to localStorage on entry
- **✅ Automatic Retrieval**: Cached usernames restored on page refresh/reload
- **✅ URL Parameter Override**: Testing support with `?username=TestUser` parameter
- **✅ Clear Username Function**: "Change" button clears both state and localStorage
- **✅ Smart Caching Logic**: URL parameters don't override localStorage cache
- **✅ Error Handling**: Graceful fallback if localStorage is disabled

**✅ Implementation Completed:**
- ✅ Created usernameStorage.ts utility with localStorage management
- ✅ Enhanced UsernameContext with automatic cache initialization
- ✅ Added URL parameter detection for testing workflows
- ✅ Implemented clearUsername function with proper state management
- ✅ Zero UI changes - maintains identical user experience
- ✅ Added development testing documentation

**✅ Testing Features:**
- ✅ URL parameter override: `?username=Alice` for multi-user testing
- ✅ Incognito window support for separate localStorage contexts
- ✅ Maintains existing testing workflows while adding persistence

### 6. ✅ Consistent UI Design System - COMPLETED
**Priority: High**
~~**Current Issue**: Inconsistent button styles and duplicate code throughout application.~~

**✅ Completed Features:**
- **✅ Button Component System**: Unified button components with variants (primary, secondary, danger, success, outline, ghost)
- **✅ IconButton Component**: Consistent icon-only buttons with proper sizing and hover effects
- **✅ Reusable Components**: UsernameDisplay and AppHeader components for consistency
- **✅ Centralized Styling**: Removed duplicate CSS and centralized button/header styles
- **✅ Better UX**: Fixed sizing inconsistencies and improved visual hierarchy

**✅ Implementation Completed:**
- ✅ Created Button.tsx with 6 variants and 3 sizes
- ✅ Created IconButton.tsx for icon-only buttons with 7 variants
- ✅ Created UsernameDisplay.tsx for consistent username UI across lobby/room
- ✅ Created AppHeader.tsx for unified header experience
- ✅ Replaced all buttons throughout application with new components
- ✅ Cleaned up 260+ bytes of duplicate CSS styles
- ✅ Improved lobby header styling (no background, centered, better spacing)

### 7. ✅ Enhanced UX Improvements - COMPLETED
**Priority: Medium**
~~**Current Issue**: Various UX friction points and inconsistent interactions.~~

**✅ Completed Features:**
- **✅ Keyboard Shortcuts**: Enter key handling in password and settings modals
- **✅ Better Error Handling**: Distinguished room not found vs password required errors
- **✅ Toast Positioning**: Moved notifications to bottom-right for less intrusion
- **✅ Host Access**: Room hosts no longer need password to join their own private rooms
- **✅ Visual Consistency**: Unified close buttons and consistent styling patterns

**✅ Implementation Completed:**
- ✅ Added Enter key handlers for form submission in modals
- ✅ Fixed room existence error bug with proper error types
- ✅ Repositioned ToastContainer to bottom-right
- ✅ Updated server logic to skip password validation for room hosts
- ✅ Refactored CloseButton into reusable component for consistency

### 3. ✅ React Router Integration with Direct Room Links - COMPLETED
**Priority: High**
~~**Current Issue**: No deep linking support - users cannot share direct room links.~~

**✅ Completed Features:**
- **✅ URL-based Room Joining**: Support `/room/:roomId` URLs for direct access
- **✅ Username Prompt**: Redirect to username input if not set when accessing room link
- **✅ Room Validation**: Check if room exists before attempting to join
- **✅ Fallback Handling**: Graceful fallback to lobby with toast notifications if room doesn't exist

**✅ Implementation Completed:**
- ✅ Installed and configured React Router
- ✅ Added route definitions for lobby and room views
- ✅ Updated navigation logic to use programmatic routing
- ✅ Implemented room existence validation
- ✅ Added username requirement check before room access

### 4. ✅ Private Rooms with Password Protection - COMPLETED
**Priority: Medium**
~~**Current Issue**: All rooms are public and visible to everyone.~~

**✅ Completed Features:**
- **✅ Private Room Creation**: Toggle for creating password-protected rooms with password input
- **✅ Password Entry UI**: Modal for entering room password when joining private rooms via URL
- **✅ Room Visibility**: Private rooms filtered from public room list on server-side
- **✅ Direct Link Access**: Private rooms accessible via direct URL with password validation
- **✅ Host Password Management**: Comprehensive settings modal for hosts to view/modify room passwords
- **✅ Copy Link Button**: Clickable room ID in header copies room URL to clipboard with toast feedback
- **✅ Real-time Updates**: Password changes broadcast immediately to room participants

**✅ Implementation Completed:**
- ✅ Extended Room interface with isPrivate and password fields
- ✅ Added password creation UI to room creation modal with public/private toggle
- ✅ Implemented server-side password validation on join attempts
- ✅ Private rooms filtered from getActiveRooms() to prevent public visibility
- ✅ Created password entry modal component with proper error handling
- ✅ Added socket events: validateRoomPassword, updateRoomPassword
- ✅ Built comprehensive RoomSettings component with Jira and password management
- ✅ Integrated clipboard API with fallback for room link sharing
- ✅ Added real-time room state synchronization including privacy data

### 5. ✅ Estimation Session Management - COMPLETED
**Priority: High - IMMEDIATE NEXT FEATURE**
~~**Current Issue**: No clear session workflow or voting round management.~~

**✅ Completed Features:**
- **✅ Voting Rounds**: 
  - Clear distinction between voting and reveal phases (idle/voting/revealed)
  - Host can start/end voting rounds with dedicated controls
  - Hide votes until reveal phase (shows *** during voting)
- **✅ Estimation Results**:
  - Average, median, and mode calculations
  - Consensus detection (identical votes or within 1 point)
  - Final estimate assignment to tasks with quick-select options
- **✅ Session Control**:
  - Start/reset voting sessions with proper state management
  - Clear votes button for re-voting
  - Finalization workflow with custom estimates
- **✅ Card Integration**:
  - Cards disabled outside voting phase
  - Selected cards reset on phase transitions for all users

**✅ Implementation Completed:**
- ✅ Added session state management with three phases (idle/voting/revealed)
- ✅ Implemented vote hiding/revealing logic in backend
- ✅ Added comprehensive estimation calculation utilities
- ✅ Created SessionControls component with full UI workflow
- ✅ Integrated with existing task management system

### 6. ✅ React Router Integration - COMPLETED
**Priority: High**
~~**Current Issue**: Application relies on internal state for navigation, making rooms non-shareable and causing username re-entry on navigation.~~

**✅ Completed Features:**
- **✅ URL-Based Navigation**: Proper routing with `/` for lobby and `/room/:roomId` for rooms
- **✅ Shareable Room Links**: Users can share direct room URLs with others
- **✅ Username Persistence**: Global username context eliminates duplicate username prompts
- **✅ Room Validation**: Server-side room existence checking with proper error handling
- **✅ Browser Navigation**: Full support for back/forward buttons and bookmarking
- **✅ Error Handling**: Graceful handling of invalid room IDs with toast notifications and automatic redirect
- **✅ Card Animation**: Sequential card animations when voting starts, creating engaging visual feedback

**✅ Technical Implementation:**
- ✅ Added React Router DOM with BrowserRouter, Routes, and Route components
- ✅ Created UsernameContext for global username state management
- ✅ Implemented LobbyRoute and RoomRoute components with proper navigation
- ✅ Added `roomExists()` method to server RoomManager
- ✅ Enhanced socket event handling for room validation  
- ✅ Updated navigation flow to use programmatic routing
- ✅ Integrated react-toastify for user-friendly error notifications
- ✅ Implemented card animation system with sequential timing and CSS transitions
- ✅ Fixed leave room race conditions and phantom user issues

### 7. Enhanced Voting System
**Priority: Medium**
**Current Issue**: Limited voting options and no vote confidence tracking.

**Features to Add:**
- **Custom Card Decks**:
  - Fibonacci sequence (default)
  - T-shirt sizes (XS, S, M, L, XL, XXL)
  - Custom numeric scales
  - Hours/days estimation
- **Vote Confidence**:
  - Confidence level (Low, Medium, High)
  - Optional comments on votes
- **Voting Statistics**:
  - Vote distribution charts
  - Historical voting patterns
  - Individual user voting history

**Implementation Plan:**
- Create deck configuration system
- Extend vote data structure
- Add confidence and comment fields
- Implement voting statistics tracking

### 8. Room Persistence and History
**Priority: Medium**
**Current Issue**: Rooms are ephemeral and estimation history is lost.

**Features to Add:**
- **Room Persistence**:
  - Optional room persistence (create permanent rooms)
  - Room templates for recurring estimation sessions
  - Room settings (public/private, max users, etc.)
- **Estimation History**:
  - Save completed estimations
  - Export results (CSV, JSON)
  - Session summaries and reports
- **User Profiles**:
  - Optional user accounts
  - Estimation history per user
  - Personal statistics

**Implementation Plan:**
- Add database integration (SQLite/PostgreSQL)
- Implement room persistence options
- Create export functionality
- Add optional user authentication

### 9. Collaboration Features
**Priority: Medium**
**Current Issue**: Limited collaboration beyond voting.

**Features to Add:**
- **Discussion Phase**:
  - Built-in chat for each task
  - Voice notes (optional)
  - Decision reasoning capture
- **Observer Mode**:
  - Non-voting participants (stakeholders, observers)
  - Read-only room access
- **Breakout Discussions**:
  - Private discussions before voting
  - Anonymous questioning system

**Implementation Plan:**
- Add chat system with Socket.IO
- Implement user role management
- Create discussion UI components
- Add observer role functionality

### 10. Advanced Host Controls
**Priority: Low**
**Current Issue**: Limited host management capabilities.

**Features to Add:**
- **Moderation Tools**:
  - Kick/ban users
  - Mute users during voting
  - Room access controls
- **Facilitation Features**:
  - Guided estimation workflows
  - Break timers
  - Voting reminders
- **Room Analytics**:
  - Participation metrics
  - Voting patterns analysis
  - Session duration tracking

**Implementation Plan:**
- Extend host permissions system
- Add moderation UI components
- Implement user management controls
- Create analytics dashboard

### 11. ✅ Docker Production Deployment - COMPLETED
**Priority: High**
~~**Current Issue**: Application runs only in development mode without production containerization.~~

**✅ Completed Features:**
- **✅ Containerization**:
  - Multi-stage Docker build for client with Alpine Linux optimization
  - Production Node.js server container with security hardening
  - Docker Compose orchestration for both local and production deployment
  - Comprehensive environment variable management with .env files
- **✅ Production Optimization**:
  - Traefik integration with proper routing labels and SSL support
  - Health checks and container restart policies
  - Corporate VPN/proxy support with HTTP_PROXY configuration
  - Resource limits and security configurations
- **✅ Deployment Infrastructure**:
  - Production and local environment configurations
  - Automated deployment script with error handling
  - Environment variable validation and defaults
  - Comprehensive deployment documentation

**✅ Implementation Completed:**
- ✅ Created multi-stage Dockerfile for React client (Alpine + nginx)
- ✅ Created production Dockerfile for Node.js server with non-root user
- ✅ Configured Docker Compose for production (Traefik) and local deployment
- ✅ Implemented comprehensive environment variable system
- ✅ Added VPN/proxy support for corporate environments
- ✅ Created deployment script with health checks and logging
- ✅ Fixed WSL2/Windows networking issues for local development
- ✅ Added environment variable validation and dynamic URL generation

**Detailed Technical Requirements:**

**Client Container:**
- Multi-stage build: Node.js build stage + Nginx serving stage
- Optimized production build with asset compression
- Static file serving with proper caching headers
- Traefik labels for routing (e.g., Host: planning-poker.yourdomain.com)

**Server Container:**
- Production Node.js runtime with minimal dependencies
- Health check endpoints for container orchestration
- Graceful shutdown handling for Socket.IO connections
- Environment-based configuration (ports, CORS, etc.)
- Traefik labels for API routing and WebSocket support

**Infrastructure:**
- Traefik integration with proper labels and networks
- Docker networks for internal service communication
- Volume management for persistent data (if needed)
- Automatic SSL certificate management via Traefik + Let's Encrypt

**Security:**
- Non-root user execution in containers
- Secrets management for sensitive configuration
- Network isolation between services
- Regular security updates in base images

**Traefik Integration (Existing Instance):**
- Connect to existing Traefik network on VPS
- Client container (nginx) serves static React build
- Server container (Node.js) handles API and WebSocket connections
- Traefik routes based on path: frontend for `/`, backend for `/socket.io`
- SSL termination handled by existing Traefik + Let's Encrypt

**Example Docker Compose Configuration:**
```yaml
version: '3.8'

services:
  planning-poker-client:
    build:
      context: ./client
      dockerfile: Dockerfile.prod
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.planning-poker-client.rule=Host(`planning-poker.yourdomain.com`)"
      - "traefik.http.routers.planning-poker-client.tls=true"
      - "traefik.http.routers.planning-poker-client.tls.certresolver=letsencrypt"
      - "traefik.http.services.planning-poker-client.loadbalancer.server.port=80"

  planning-poker-server:
    build:
      context: ./server
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - CLIENT_URL=https://planning-poker.yourdomain.com
    networks:
      - traefik
      - internal
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.planning-poker-server.rule=Host(`planning-poker.yourdomain.com`) && PathPrefix(`/socket.io`)"
      - "traefik.http.routers.planning-poker-server.tls=true"
      - "traefik.http.routers.planning-poker-server.tls.certresolver=letsencrypt"
      - "traefik.http.services.planning-poker-server.loadbalancer.server.port=3001"

networks:
  traefik:
    external: true
  internal:
    driver: bridge
```

**Required Dockerfile Examples:**

**Client Dockerfile (client/Dockerfile.prod):**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Server Dockerfile (server/Dockerfile.prod):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
USER node
CMD ["node", "dist/index.js"]
```

**Nginx Configuration (client/nginx.conf):**
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        
        # Static file caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, no-transform";
        }
        
        # React Router (handle client-side routing)
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

**Integration Notes:**
- Ensure your existing Traefik has a network named `traefik`
- The `external: true` network connects to your existing Traefik instance
- Update `planning-poker.yourdomain.com` to your actual domain
- Ensure your Traefik instance has the same `certresolver` name (commonly `letsencrypt`)
- Server container needs `/socket.io` path prefix for Socket.IO to work correctly

**Your Existing Traefik Requirements:**
```yaml
# In your existing Traefik configuration, ensure:
# 1. Docker provider is enabled
# 2. Network named 'traefik' exists
# 3. Let's Encrypt certificate resolver is configured

# Example traefik.yml snippet:
providers:
  docker:
    network: traefik
    exposedByDefault: false

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@domain.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

**Deployment Commands:**
```bash
# 1. Clone the repository on your VPS
git clone <your-repo> planning-poker
cd planning-poker

# 2. Create production environment file
echo "NODE_ENV=production" > .env
echo "CLIENT_URL=https://planning-poker.yourdomain.com" >> .env

# 3. Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 4. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Monitoring:**
- Container health checks and restart policies
- Application logging with structured output
- Performance metrics collection
- Error tracking and alerting setup

### 12. Mobile and Accessibility Improvements
**Priority: Medium**
**Current Issue**: Limited mobile responsiveness and accessibility.

**Features to Add:**
- **Mobile Optimization**:
  - Touch-friendly card selection
  - Responsive layout improvements
  - Mobile-specific UI patterns
- **Accessibility**:
  - ARIA labels and roles
  - Keyboard navigation support
  - Screen reader compatibility
  - High contrast mode

**Implementation Plan:**
- Audit current accessibility
- Implement responsive design improvements
- Add ARIA attributes
- Test with screen readers

## Implementation Priority Order

### Phase 1: Core Functionality Completion (2-3 weeks) - ✅ COMPLETED
1. **✅ Task/Story Management System** - COMPLETED
2. **✅ Estimation Session Management** - COMPLETED  
3. **✅ React Router Integration with Direct Room Links** - COMPLETED

### Phase 2: User Experience Improvements (2-3 weeks) - ✅ COMPLETED
1. **✅ Private Rooms with Password Protection** - COMPLETED
2. **✅ Local Username Caching** - COMPLETED
3. **✅ Consistent UI Design System** - COMPLETED
4. **✅ Enhanced UX Improvements** - COMPLETED

### Phase 2.5: Production Deployment (1-2 weeks) - ✅ COMPLETED
1. **✅ Docker Production Deployment** - COMPLETED
2. **🎯 CI/CD Pipeline Setup** - NEXT PRIORITY
3. Production Monitoring and Logging

### Phase 3: Advanced Features (3-4 weeks)
1. Room Persistence and History
2. Export and Import functionality
3. Custom voting decks
4. Advanced analytics

### Phase 4: Collaboration Features (4-5 weeks)
1. Discussion/Chat system
2. Observer mode
3. Advanced host controls

### Phase 5: Polish and Accessibility (2-3 weeks)
1. Mobile optimization
2. Accessibility improvements
3. UI/UX refinements

## Technical Considerations

### Database Schema (for persistence features)
```sql
-- Rooms table
CREATE TABLE rooms (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  created_at TIMESTAMP,
  is_persistent BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  password VARCHAR(255),
  host_id VARCHAR(255),
  settings JSON
);

-- Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255) REFERENCES rooms(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  acceptance_criteria TEXT,
  priority VARCHAR(50),
  status VARCHAR(50),
  final_estimate VARCHAR(50),
  created_at TIMESTAMP
);

-- Votes table
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id),
  user_id VARCHAR(255),
  username VARCHAR(255),
  vote_value VARCHAR(50),
  confidence VARCHAR(50),
  comment TEXT,
  created_at TIMESTAMP
);
```

### New Socket Events
```typescript
// Task management (✅ COMPLETED)
'createTask', 'updateTask', 'deleteTask', 'setCurrentTask'

// Room management with passwords
'createPrivateRoom', 'joinRoomWithPassword', 'validateRoomPassword'

// Enhanced host transfer
'requestHostTransfer', 'confirmHostTransfer', 'declineHostTransfer'

// Session management
'startVoting', 'endVoting', 'revealVotes', 'finalizeEstimate'

// Room validation
'checkRoomExists', 'getRoomInfo'

// Chat/Discussion
'sendMessage', 'messageReceived'

// Advanced features
'exportSession', 'saveSession', 'loadSession'
```

### Component Structure Updates
```
components/
├── TaskManagement/ (✅ COMPLETED)
│   ├── TaskList.tsx (✅ COMPLETED)
│   ├── TaskForm.tsx (✅ integrated in TaskList)
│   ├── TaskDetails.tsx (✅ integrated in TaskList)
│   └── TaskNavigation.tsx (✅ integrated in TaskList)
├── Auth/
│   ├── UsernameCache.tsx (NEW)
│   └── PasswordEntry.tsx (NEW)
├── Routing/
│   ├── RoomRoute.tsx (NEW)
│   ├── LobbyRoute.tsx (NEW)
│   └── PrivateRoute.tsx (NEW)
├── RoomManagement/
│   ├── PrivateRoomCreation.tsx (NEW)
│   ├── HostTransferConfirmation.tsx (NEW)
│   └── RoomPasswordSettings.tsx (NEW)
├── SessionControls/
│   ├── VotingControls.tsx
│   ├── EstimationResults.tsx
│   └── SessionTimer.tsx
├── Chat/
│   ├── ChatPanel.tsx
│   ├── MessageList.tsx
│   └── MessageInput.tsx
└── Admin/
    ├── RoomSettings.tsx
    ├── UserManagement.tsx
    └── Analytics.tsx
```

## Success Metrics
- **User Engagement**: Increased session duration and repeat usage
- **Estimation Quality**: More consistent and accurate estimations
- **Team Collaboration**: Better discussion and consensus building
- **Workflow Efficiency**: Reduced time to complete estimation sessions
- **User Satisfaction**: Positive feedback on new features

## Risk Mitigation
- **Backward Compatibility**: Ensure existing functionality continues to work
- **Performance**: Monitor WebSocket load with increased features
- **Data Privacy**: Implement proper data handling for persistent features
- **Scalability**: Plan for increased concurrent users and data storage

## 13. CI/CD Pipeline Setup
**Priority: High - NEXT PRIORITY**
**Current Issue**: Manual deployment process requires SSH access and manual script execution on VPS.

**Proposed Solution**: Automated GitHub Actions workflow for continuous deployment to VPS.

### CI/CD Architecture Plan

**GitHub Actions Workflow Triggers:**
- Push to `main` branch (production deployment)
- Manual workflow dispatch for emergency deployments
- Optional: Push to `develop` branch (staging deployment)

**Deployment Strategy:**
1. **SSH-based deployment** to existing VPS infrastructure
2. **Git pull + rebuild** approach using existing `deploy.sh` script
3. **Zero-downtime deployment** with Docker container orchestration
4. **Rollback capability** using git tags and container versioning

### Technical Implementation Plan

**Required GitHub Secrets:**
```yaml
# VPS Connection
VPS_HOST: "your-server-ip-or-domain"
VPS_USER: "deploy-user"  # Non-root user with Docker permissions
VPS_SSH_KEY: "-----BEGIN OPENSSH PRIVATE KEY-----..."  # Private SSH key

# Application Configuration
DOMAIN: "planning-poker.yourdomain.com"
DOCKER_REGISTRY: "ghcr.io"  # Optional: for container registry
```

**SSH Key Setup Requirements:**
1. Generate dedicated deployment SSH key pair
2. Add public key to VPS user's `~/.ssh/authorized_keys`
3. Ensure deployment user has Docker permissions (`docker` group membership)
4. Configure SSH key restrictions for security (command restrictions if needed)

**VPS Deployment User Setup:**
```bash
# On VPS: Create deployment user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy
sudo mkdir -p /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh

# Add SSH public key to authorized_keys
sudo nano /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

**GitHub Actions Workflow Structure:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v0.1.8
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/deploy/planning-poker
            git pull origin main
            ./deploy.sh deploy
```

**Deployment Process Flow:**
1. **Code Push**: Developer pushes to main branch
2. **GitHub Actions Trigger**: Workflow starts automatically
3. **SSH Connection**: Connect to VPS using stored SSH key
4. **Code Update**: `git pull origin main` to get latest changes
5. **Container Rebuild**: `./deploy.sh deploy` rebuilds and restarts containers
6. **Health Check**: Verify deployment success via container status
7. **Notification**: Send deployment status (success/failure)

**Advanced Deployment Features:**

**Pre-deployment Checks:**
- Build validation (ensure code compiles)
- Docker image build test
- Environment variable validation
- SSL certificate status check

**Deployment Process:**
- Backup current deployment state
- Pull latest code changes
- Build new Docker images
- Rolling update with health checks
- Automatic rollback on failure

**Post-deployment Verification:**
- Container health status
- HTTP endpoint availability check
- Socket.IO connection test
- Basic functionality smoke test

**Security Considerations:**
- SSH key rotation schedule
- Deployment user privilege limitation
- Audit logging for deployments
- Secrets rotation and management

**Rollback Strategy:**
```yaml
# Emergency rollback workflow
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      commit_hash:
        description: 'Commit hash to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback to specific commit
        uses: appleboy/ssh-action@v0.1.8
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/deploy/planning-poker
            git checkout ${{ github.event.inputs.commit_hash }}
            ./deploy.sh deploy
```

**Monitoring and Notifications:**
- Deployment success/failure notifications (Slack, Discord, email)
- Performance metrics collection post-deployment
- Error rate monitoring after deployment
- Automatic alerting for deployment issues

### Implementation Steps

**Phase 1: Basic CI/CD Setup**
1. Create GitHub Actions workflow file
2. Set up VPS deployment user and SSH keys
3. Configure GitHub repository secrets
4. Test basic deployment pipeline
5. Add deployment status notifications

**Phase 2: Enhanced Pipeline**
1. Add pre-deployment validation steps
2. Implement health checks and smoke tests
3. Add rollback workflow capability
4. Set up deployment monitoring
5. Document deployment process

**Phase 3: Advanced Features**
1. Multi-environment support (staging/production)
2. Blue-green deployment strategy
3. Database migration automation
4. Performance regression testing
5. Automated security scanning

### Benefits of Automated CI/CD

**Developer Experience:**
- Instant deployment on merge to main
- Consistent deployment process
- Reduced manual errors
- Faster iteration cycles

**Operations Benefits:**
- Reduced downtime deployments
- Automated rollback capability
- Deployment audit trail
- Standardized deployment process

**Security Improvements:**
- Automated security updates
- Controlled access to production
- Encrypted deployment credentials
- Deployment approval workflows (optional)

### Existing Infrastructure Integration

The CI/CD pipeline leverages your existing Docker deployment infrastructure:
- **Existing `deploy.sh` script**: No changes needed, GitHub Actions calls existing script
- **Docker Compose setup**: Continues using current production configuration
- **Traefik integration**: Maintains existing reverse proxy and SSL setup
- **Environment management**: Uses existing `.env.production` configuration

### Risk Mitigation

**Deployment Failures:**
- Automatic rollback on health check failure
- Container restart policies maintain availability
- Manual rollback workflow for emergency situations

**Security Risks:**
- SSH key rotation procedures
- Deployment user isolation
- Audit logging for all deployments
- Secrets management best practices

**Infrastructure Dependencies:**
- VPS availability monitoring
- Docker service health checks
- Database backup before deployments
- Network connectivity validation

This CI/CD setup transforms your manual deployment process into a fully automated, reliable, and secure deployment pipeline while maintaining compatibility with your existing infrastructure.

### Version Information Display

**Version Display Component:**
A subtle version information indicator in the application header that provides deployment and version details.

**UI Design:**
- **Question mark icon** (`?`) in top-right corner of header
- **Hover tooltip** showing version information
- **Minimal footprint** - doesn't interfere with existing UI
- **Consistent styling** with existing IconButton component system

**Version Information Displayed:**
```
Planning Poker v1.0.0
Build: abc1234 (main)
Deployed: 2024-01-15 14:30 UTC
Environment: Production
```

**Technical Implementation:**

**Build-time Version Injection:**
```javascript
// In client package.json build script
"build": "REACT_APP_VERSION=$npm_package_version REACT_APP_BUILD_HASH=$(git rev-parse --short HEAD) REACT_APP_BUILD_BRANCH=$(git branch --show-current) REACT_APP_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ) react-scripts build"
```

**Environment Variables Available in React:**
- `REACT_APP_VERSION`: From root package.json version (1.0.0)
- `REACT_APP_BUILD_HASH`: Git commit hash (short)
- `REACT_APP_BUILD_BRANCH`: Git branch name
- `REACT_APP_BUILD_TIME`: ISO timestamp of build
- `REACT_APP_ENV`: Environment (Production/Local)

**VersionInfo Component:**
```tsx
// components/VersionInfo.tsx
interface VersionInfoProps {
  className?: string;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ className }) => {
  const version = process.env.REACT_APP_VERSION || 'dev';
  const buildHash = process.env.REACT_APP_BUILD_HASH || 'local';
  const buildBranch = process.env.REACT_APP_BUILD_BRANCH || 'unknown';
  const buildTime = process.env.REACT_APP_BUILD_TIME || 'unknown';
  const environment = process.env.NODE_ENV === 'production' ? 'Production' : 'Development';

  const versionText = `Planning Poker v${version}\nBuild: ${buildHash} (${buildBranch})\nBuilt: ${buildTime}\nEnvironment: ${environment}`;

  return (
    <div className={`version-info ${className || ''}`}>
      <IconButton
        variant="ghost"
        size="small"
        title={versionText}
        className="version-button"
      >
        <FontAwesomeIcon icon={faQuestionCircle} />
      </IconButton>
    </div>
  );
};
```

**CSS Styling:**
```css
/* components/VersionInfo.css */
.version-info {
  position: relative;
}

.version-button {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.version-button:hover {
  opacity: 1;
}

/* Tooltip styling for multiline text */
.version-button[title] {
  position: relative;
  white-space: pre-line;
}
```

**Integration with AppHeader:**
```tsx
// Update AppHeader.tsx to include VersionInfo
<div className="header-right">
  {rightContent}
  <VersionInfo className="header-version" />
</div>
```

**CI/CD Integration:**

**Enhanced GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml - Updated version
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for git info

      - name: Deploy to VPS with version info
        uses: appleboy/ssh-action@v0.1.8
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/deploy/planning-poker
            git pull origin main
            
            # Set version environment variables for build
            export BUILD_VERSION=$(node -p "require('./package.json').version")
            export BUILD_HASH=$(git rev-parse --short HEAD)
            export BUILD_BRANCH=$(git branch --show-current)
            export BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
            
            # Update .env.production with build info
            echo "REACT_APP_VERSION=$BUILD_VERSION" >> .env.production
            echo "REACT_APP_BUILD_HASH=$BUILD_HASH" >> .env.production
            echo "REACT_APP_BUILD_BRANCH=$BUILD_BRANCH" >> .env.production
            echo "REACT_APP_BUILD_TIME=$BUILD_TIME" >> .env.production
            
            # Deploy with version info
            ./deploy.sh deploy
```

**Docker Build Integration:**
```dockerfile
# client/Dockerfile.prod - Updated with version args
FROM node:18-alpine AS builder
WORKDIR /app

# Accept build args for version info
ARG REACT_APP_VERSION
ARG REACT_APP_BUILD_HASH
ARG REACT_APP_BUILD_BRANCH
ARG REACT_APP_BUILD_TIME

# Set environment variables
ENV REACT_APP_VERSION=$REACT_APP_VERSION
ENV REACT_APP_BUILD_HASH=$REACT_APP_BUILD_HASH
ENV REACT_APP_BUILD_BRANCH=$REACT_APP_BUILD_BRANCH
ENV REACT_APP_BUILD_TIME=$REACT_APP_BUILD_TIME

COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage remains the same
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Updated deploy.sh Integration:**
```bash
# Add to deploy.sh before docker-compose commands
log_info "Setting build version information..."

# Get version info
BUILD_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
BUILD_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Export for docker-compose
export REACT_APP_VERSION="$BUILD_VERSION"
export REACT_APP_BUILD_HASH="$BUILD_HASH"
export REACT_APP_BUILD_BRANCH="$BUILD_BRANCH"
export REACT_APP_BUILD_TIME="$BUILD_TIME"

log_info "Building version: $BUILD_VERSION ($BUILD_HASH)"
```

**Benefits:**
- **Deployment Tracking**: Instantly see which version is deployed
- **Debug Information**: Build hash helps identify specific deployments
- **Environment Verification**: Confirm production vs development builds
- **Deployment History**: Build timestamps provide deployment timeline
- **Git Integration**: Branch and commit info for traceability

**User Experience:**
- **Unobtrusive**: Small question mark icon doesn't interfere with UI
- **Informative**: Hover provides comprehensive version details
- **Consistent**: Uses existing design system components
- **Accessible**: Proper tooltip and ARIA attributes

This plan provides a roadmap for transforming the simple planning poker tool into a comprehensive estimation and collaboration platform while maintaining the simplicity and effectiveness of the current system.
