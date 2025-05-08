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

    socket.on('createRoom', (data: { roomId: string; username: string; }) => {
        try {
            roomManager.createRoom(data.roomId, socket.id, data.username);
            socket.join(data.roomId);
            console.log(`Room created: ${data.roomId} by ${data.username}`);
            socket.emit('roomCreated', data.roomId);

            // Send current room state
            const users = roomManager.getRoomUsers(data.roomId);
            const hostId = roomManager.getHostId(data.roomId);
            io.to(data.roomId).emit('roomState', { users, hostId });

            // Broadcast updated room list
            broadcastRoomList();
        } catch (error) {
            socket.emit('error', 'Failed to create room');
        }
    });

    socket.on('joinRoom', (data: { roomId: string; username: string; }) => {
        try {
            if (roomManager.joinRoom(data.roomId, socket.id, data.username)) {
                socket.join(data.roomId);
                console.log(`User ${data.username} joined room: ${data.roomId}`);
                socket.emit('roomJoined', data.roomId);

                // Notify others in the room
                socket.to(data.roomId).emit('userJoined', { id: socket.id, username: data.username });

                // Send current room state
                const users = roomManager.getRoomUsers(data.roomId);
                const hostId = roomManager.getHostId(data.roomId);
                io.to(data.roomId).emit('roomState', { users, hostId });

                // Broadcast updated room list
                broadcastRoomList();
            } else {
                socket.emit('error', 'Room not found');
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
            const users = roomManager.getRoomUsers(data.roomId);
            const hostId = roomManager.getHostId(data.roomId);
            io.to(data.roomId).emit('roomState', { users, hostId });

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
        if (roomManager.leaveRoom(roomId, socket.id)) {
            socket.leave(roomId);
            socket.emit('roomLeft');

            // Notify remaining users in the room
            const room = roomManager.getRoomUsers(roomId);
            if (room.length > 0) {
                const hostId = roomManager.getHostId(roomId);
                if (hostId) {
                    io.to(roomId).emit('roomState', { users: room, hostId });
                    io.to(roomId).emit('hostChanged', hostId);
                }
            }
            // Broadcast updated room list when someone leaves
            broadcastRoomList();
        }
    });

    socket.on('transferHost', ({ roomId, newHostId }) => {
        if (roomManager.transferHost(roomId, socket.id, newHostId)) {
            io.to(roomId).emit('hostChanged', newHostId);
            // Broadcast updated room list when host changes
            broadcastRoomList();
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Remove user from all rooms and clean up votes
        roomManager.handleDisconnect(socket.id);

        // Notify all rooms the user was in
        socket.rooms.forEach(roomId => {
            if (roomId !== socket.id) { // socket.id is always in socket.rooms
                const users = roomManager.getRoomUsers(roomId);
                const hostId = roomManager.getHostId(roomId);
                io.to(roomId).emit('roomState', { users, hostId });
            }
        });

        // Broadcast updated room list
        broadcastRoomList();
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
