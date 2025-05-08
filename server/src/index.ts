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

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('createRoom', (data: { roomId: string; username: string; }) => {
        try {
            roomManager.createRoom(data.roomId);
            if (roomManager.joinRoom(data.roomId, socket.id, data.username)) {
                socket.join(data.roomId);
                console.log(`Room created: ${data.roomId} by ${data.username}`);
                socket.emit('roomCreated', data.roomId);

                // Send current room state
                const users = roomManager.getRoomUsers(data.roomId);
                io.to(data.roomId).emit('roomState', { users });
            }
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
                io.to(data.roomId).emit('roomState', { users });
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
            io.to(data.roomId).emit('roomState', { users });
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

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Remove user from all rooms and clean up votes
        roomManager.handleDisconnect(socket.id);

        // Notify all rooms the user was in
        socket.rooms.forEach(roomId => {
            if (roomId !== socket.id) { // socket.id is always in socket.rooms
                const users = roomManager.getRoomUsers(roomId);
                io.to(roomId).emit('roomState', { users });
            }
        });
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
