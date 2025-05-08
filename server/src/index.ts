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

    socket.on('createRoom', (roomId: string) => {
        try {
            roomManager.createRoom(roomId);
            socket.join(roomId);
            console.log(`Room created: ${roomId}`);
            socket.emit('roomCreated', roomId);
        } catch (error) {
            socket.emit('error', 'Failed to create room');
        }
    });

    socket.on('joinRoom', (roomId: string) => {
        try {
            if (roomManager.joinRoom(roomId)) {
                socket.join(roomId);
                console.log(`User ${socket.id} joined room: ${roomId}`);
                socket.emit('roomJoined', roomId);

                // Notify others in the room
                socket.to(roomId).emit('userJoined', socket.id);
            } else {
                socket.emit('error', 'Room not found');
            }
        } catch (error) {
            socket.emit('error', 'Failed to join room');
        }
    });

    socket.on('vote', (data: { roomId: string; value: string; }) => {
        const { roomId, value } = data;
        if (roomManager.addVote(roomId, socket.id, value)) {
            // Broadcast the vote to everyone in the room
            io.to(roomId).emit('vote', {
                userId: socket.id,
                value
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Remove user from all rooms and clean up votes
        roomManager.handleDisconnect(socket.id);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
