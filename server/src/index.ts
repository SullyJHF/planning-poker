import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './RoomManager';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

const roomManager = new RoomManager();

// Helper function to build room state
const buildRoomState = (roomId: string) => {
    const users = roomManager.getRoomUsers(roomId);
    const hostId = roomManager.getHostId(roomId);
    const tasks = roomManager.getTasks(roomId);
    const currentTask = roomManager.getCurrentTask(roomId);
    const jiraBaseUrl = roomManager.getJiraBaseUrl(roomId);
    const roomPrivacy = roomManager.getRoomPrivacy(roomId);
    
    return { 
        users, 
        hostId, 
        tasks, 
        currentTaskId: currentTask?.id, 
        jiraBaseUrl,
        isPrivate: roomPrivacy?.isPrivate || false,
        password: roomPrivacy?.password
    };
};

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Function to broadcast room list to all clients
const broadcastRoomList = () => {
    const rooms = roomManager.getActiveRooms();
    io.emit('roomList', rooms);
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial room list to the new client
    socket.emit('roomList', roomManager.getActiveRooms());

    socket.on('ping', (callback: (response: boolean) => void) => {
        callback(true);
    });

    socket.on('createRoom', (data: { roomId: string; username: string; isPrivate?: boolean; password?: string; }) => {
        try {
            roomManager.createRoom(data.roomId, socket.id, data.username, data.isPrivate || false, data.password);
            socket.join(data.roomId);
            console.log(`Room created: ${data.roomId} by ${data.username} (${data.isPrivate ? 'private' : 'public'})`);
            socket.emit('roomCreated', data.roomId);

            // Send current room state
            const roomState = buildRoomState(data.roomId);
            
            // Send to the creating socket first
            socket.emit('roomState', roomState);
            // Then broadcast to the room
            io.to(data.roomId).emit('roomState', roomState);

            // Broadcast updated room list
            broadcastRoomList();
        } catch (error) {
            socket.emit('error', 'Failed to create room');
        }
    });

    socket.on('joinRoom', (data: { roomId: string; username: string; password?: string; }) => {
        try {
            console.log(`Server: joinRoom attempt - roomId: ${data.roomId}, username: ${data.username}, socket: ${socket.id}`);
            
            // Check if room exists first
            if (!roomManager.roomExists(data.roomId)) {
                console.log(`Server: Room ${data.roomId} does not exist`);
                socket.emit('error', { type: 'roomNotFound', message: 'Room not found' });
                return;
            }

            if (roomManager.joinRoom(data.roomId, socket.id, data.username, data.password)) {
                socket.join(data.roomId);
                console.log(`Server: User ${data.username} successfully joined room: ${data.roomId}`);
                socket.emit('roomJoined', data.roomId);

                // Notify others in the room
                socket.to(data.roomId).emit('userJoined', { id: socket.id, username: data.username });

                // Send current room state
                const roomState = buildRoomState(data.roomId);
                const sessionState = roomManager.getSessionState(data.roomId);
                
                console.log(`Server: Broadcasting room state to room ${data.roomId} - ${roomState.users.length} users:`, roomState.users.map(u => `${u.username}(${u.id})`));
                io.to(data.roomId).emit('roomState', roomState);
                
                // Send current votes and session state to the new user
                const votes = roomManager.getRoomVotes(data.roomId);
                socket.emit('votesUpdated', votes);
                if (sessionState) {
                    socket.emit('sessionStateUpdated', sessionState);
                }

                // Broadcast updated room list
                broadcastRoomList();
            } else {
                console.log(`Server: Failed to join room ${data.roomId} - password required or invalid`);
                socket.emit('error', { type: 'passwordRequired', message: 'Password required or invalid' });
            }
        } catch (error) {
            socket.emit('error', 'Failed to join room');
        }
    });

    socket.on('updateUsername', (data: { roomId: string; username: string; }) => {
        if (roomManager.updateUsername(data.roomId, socket.id, data.username)) {
            // Notify everyone in the room about the username change
            io.to(data.roomId).emit('usernameUpdated', { id: socket.id, username: data.username });

            // Send updated room state
            const roomState = buildRoomState(data.roomId);
            io.to(data.roomId).emit('roomState', roomState);

            // Broadcast updated room list
            broadcastRoomList();
        }
    });

    socket.on('vote', (data: { roomId: string; value: string; }) => {
        const { roomId, value } = data;
        if (roomManager.addVote(roomId, socket.id, value)) {
            // Broadcast the vote to everyone in the room
            const votes = roomManager.getRoomVotes(roomId);
            io.to(roomId).emit('votesUpdated', votes);
        }
    });

    socket.on('leaveRoom', ({ roomId }) => {
        console.log(`Server: leaveRoom event - roomId: ${roomId}, socket: ${socket.id}`);
        if (roomManager.leaveRoom(roomId, socket.id)) {
            socket.leave(roomId);
            console.log(`Server: User ${socket.id} successfully left room ${roomId}`);
            socket.emit('roomLeft');

            // Notify remaining users in the room
            const room = roomManager.getRoomUsers(roomId);
            console.log(`Server: After leave, room ${roomId} has ${room.length} users:`, room.map(u => `${u.username}(${u.id})`));
            if (room.length > 0) {
                const hostId = roomManager.getHostId(roomId);
                if (hostId) {
                    console.log(`Server: Broadcasting updated room state to ${room.length} users in room ${roomId}`);
                    console.log(`Server: Emitting roomState to room ${roomId}`);
                    const roomState = buildRoomState(roomId);
                    io.to(roomId).emit('roomState', roomState);
                    console.log(`Server: Emitting hostChanged to room ${roomId}`);
                    io.to(roomId).emit('hostChanged', hostId);
                }
            } else {
                console.log(`Server: Room ${roomId} is now empty`);
            }
            // Broadcast updated room list when someone leaves
            broadcastRoomList();
        } else {
            console.log(`Server: Failed to leave room ${roomId} - user ${socket.id} not in room`);
        }
    });

    socket.on('transferHost', ({ roomId, newHostId }) => {
        if (roomManager.transferHost(roomId, socket.id, newHostId)) {
            io.to(roomId).emit('hostChanged', newHostId);
            // Broadcast updated room list when host changes
            broadcastRoomList();
        }
    });

    socket.on('createTask', ({ roomId, task }) => {
        const newTask = roomManager.createTask(roomId, socket.id, task);
        if (newTask) {
            const tasks = roomManager.getTasks(roomId);
            const currentTask = roomManager.getCurrentTask(roomId);
            io.to(roomId).emit('tasksUpdated', { tasks, currentTaskId: currentTask?.id });
        }
    });

    socket.on('updateTask', ({ roomId, taskId, updates }) => {
        const updatedTask = roomManager.updateTask(roomId, socket.id, taskId, updates);
        if (updatedTask) {
            const tasks = roomManager.getTasks(roomId);
            const currentTask = roomManager.getCurrentTask(roomId);
            io.to(roomId).emit('tasksUpdated', { tasks, currentTaskId: currentTask?.id });
        }
    });

    socket.on('deleteTask', ({ roomId, taskId }) => {
        if (roomManager.deleteTask(roomId, socket.id, taskId)) {
            const tasks = roomManager.getTasks(roomId);
            const currentTask = roomManager.getCurrentTask(roomId);
            io.to(roomId).emit('tasksUpdated', { tasks, currentTaskId: currentTask?.id });
        }
    });

    socket.on('setCurrentTask', ({ roomId, taskId }) => {
        if (roomManager.setCurrentTask(roomId, socket.id, taskId)) {
            const tasks = roomManager.getTasks(roomId);
            const currentTask = roomManager.getCurrentTask(roomId);
            const sessionState = roomManager.getSessionState(roomId);
            
            // Clear existing votes and notify clients
            io.to(roomId).emit('votesUpdated', {});
            io.to(roomId).emit('tasksUpdated', { tasks, currentTaskId: currentTask?.id });
            if (sessionState) {
                io.to(roomId).emit('sessionStateUpdated', sessionState);
            }
        }
    });

    // Session Management Events
    socket.on('startVoting', ({ roomId }) => {
        if (roomManager.startVoting(roomId, socket.id)) {
            const sessionState = roomManager.getSessionState(roomId);
            const votes = roomManager.getRoomVotes(roomId);
            
            io.to(roomId).emit('sessionStateUpdated', sessionState);
            io.to(roomId).emit('votesUpdated', votes); // This will show hidden votes
        }
    });

    socket.on('revealVotes', ({ roomId }) => {
        const estimationResult = roomManager.revealVotes(roomId, socket.id);
        if (estimationResult) {
            const sessionState = roomManager.getSessionState(roomId);
            const votes = roomManager.getRoomVotes(roomId);
            
            io.to(roomId).emit('sessionStateUpdated', sessionState);
            io.to(roomId).emit('votesUpdated', votes); // This will show actual votes
            io.to(roomId).emit('estimationResult', estimationResult);
        }
    });

    socket.on('resetVoting', ({ roomId }) => {
        if (roomManager.resetVoting(roomId, socket.id)) {
            const sessionState = roomManager.getSessionState(roomId);
            
            io.to(roomId).emit('sessionStateUpdated', sessionState);
            io.to(roomId).emit('votesUpdated', {});
        }
    });

    socket.on('finalizeEstimate', ({ roomId, estimate }) => {
        if (roomManager.finalizeEstimate(roomId, socket.id, estimate)) {
            const tasks = roomManager.getTasks(roomId);
            const currentTask = roomManager.getCurrentTask(roomId);
            const sessionState = roomManager.getSessionState(roomId);
            
            io.to(roomId).emit('tasksUpdated', { tasks, currentTaskId: currentTask?.id });
            io.to(roomId).emit('sessionStateUpdated', sessionState);
            io.to(roomId).emit('votesUpdated', {});
        }
    });

    socket.on('updateJiraBaseUrl', ({ roomId, jiraBaseUrl }) => {
        if (roomManager.updateJiraBaseUrl(roomId, socket.id, jiraBaseUrl)) {
            io.to(roomId).emit('jiraBaseUrlUpdated', { jiraBaseUrl });
        }
    });

    socket.on('checkRoomExists', ({ roomId }, callback) => {
        const exists = roomManager.roomExists(roomId);
        callback(exists);
    });

    socket.on('getRoomList', () => {
        console.log(`Server: getRoomList requested by socket ${socket.id}`);
        const rooms = roomManager.getActiveRooms();
        console.log(`Server: Sending room list with ${rooms.length} rooms to socket ${socket.id}`);
        socket.emit('roomList', rooms);
    });

    socket.on('getRoomState', ({ roomId }: { roomId: string }) => {
        console.log(`Server: getRoomState requested for room ${roomId} by socket ${socket.id}`);
        const roomState = buildRoomState(roomId);
        const sessionState = roomManager.getSessionState(roomId);
        const votes = roomManager.getRoomVotes(roomId);
        
        console.log(`Server: Room ${roomId} has ${roomState.users.length} users:`, roomState.users);
        
        if (roomState.users.length > 0) { // Only send state if room exists and has users
            console.log(`Server: Sending room state for room ${roomId}`);
            socket.emit('roomState', roomState);
            socket.emit('votesUpdated', votes);
            if (sessionState) {
                socket.emit('sessionStateUpdated', sessionState);
            }
        } else {
            console.log(`Server: Room ${roomId} has no users, not sending state`);
        }
    });

    socket.on('validateRoomPassword', ({ roomId, password }, callback) => {
        const isValid = roomManager.validateRoomPassword(roomId, password);
        callback(isValid);
    });

    socket.on('updateRoomPassword', ({ roomId, password }) => {
        if (roomManager.updateRoomPassword(roomId, socket.id, password)) {
            socket.emit('roomPasswordUpdated', { success: true });
            
            // Broadcast updated room state to all users in the room
            const roomState = buildRoomState(roomId);
            io.to(roomId).emit('roomState', roomState);
        } else {
            socket.emit('roomPasswordUpdated', { success: false, error: 'Unauthorized or room not found' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove user from all rooms and get list of affected rooms
        const affectedRooms = roomManager.handleDisconnect(socket.id);
        console.log(`Server: User ${socket.id} was removed from rooms:`, affectedRooms);

        // Notify remaining users in affected rooms
        affectedRooms.forEach(roomId => {
            const users = roomManager.getRoomUsers(roomId);
            console.log(`Server: Broadcasting disconnect update to room ${roomId} with ${users.length} remaining users`);
            
            if (users.length > 0) {
                // Room still has users, broadcast updated state
                const roomState = buildRoomState(roomId);
                const hostId = roomManager.getHostId(roomId);
                
                io.to(roomId).emit('roomState', roomState);
                
                // If host changed, notify about that too
                if (hostId) {
                    io.to(roomId).emit('hostChanged', hostId);
                }
            }
            // If room is empty, it's already been deleted by handleDisconnect
        });

        // Broadcast updated room list
        broadcastRoomList();
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
