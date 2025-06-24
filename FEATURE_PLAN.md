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

**🎯 NEXT: Local Username Caching or Enhanced Voting System** - Improving user experience and workflow

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

### 2. Local Username Caching
**Priority: High**
**Current Issue**: Users must re-enter their username every time they visit the application.

**Features to Add:**
- **Persistent Username Storage**: Store username in localStorage for automatic retrieval
- **Username Validation**: Validate cached username is still valid format
- **Clear Username Option**: Allow users to clear stored username if desired
- **Auto-populate**: Pre-fill username input with cached value

**Implementation Plan:**
- Add localStorage utility functions for username persistence
- Update UsernameInput component to check for cached username
- Add clear/reset username functionality in user settings
- Implement username validation on startup

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

### 4. Private Rooms with Password Protection
**Priority: Medium**
**Current Issue**: All rooms are public and visible to everyone.

**Features to Add:**
- **Private Room Creation**: Option to create password-protected rooms
- **Password Entry UI**: Modal for entering room password when joining
- **Room Visibility**: Private rooms hidden from public room list
- **Direct Link Access**: Private rooms accessible via direct link + password
- **Host Password Management**: Host can view/change room password

**Implementation Plan:**
- Extend Room interface to include isPrivate and password fields
- Add password creation UI to room creation flow
- Implement password validation on join attempts
- Filter private rooms from public room list
- Add password entry modal component
- Update socket events to handle password validation

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

### 11. Mobile and Accessibility Improvements
**Priority: Low**
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

### Phase 2: User Experience Improvements (2-3 weeks) - 🔄 IN PROGRESS
1. Local Username Caching
2. Enhanced Host Transfer System
3. Enhanced Voting System (basic features)

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

This plan provides a roadmap for transforming the simple planning poker tool into a comprehensive estimation and collaboration platform while maintaining the simplicity and effectiveness of the current system.
