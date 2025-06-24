import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { Room, RoomList } from './RoomList';
import './LobbyView.css';

interface LobbyViewProps {
    username: string;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ username }) => {
    const { socket } = useSocket();
    const navigate = useNavigate();
    const [activeRooms, setActiveRooms] = useState<Room[]>([]);

    useEffect(() => {
        if (!socket) return;

        // Request current room list when component mounts
        console.log('LobbyView: Requesting current room list');
        socket.emit('getRoomList');

        socket.on('roomList', (rooms: Room[]) => {
            console.log('LobbyView: Received room list with', rooms.length, 'rooms');
            setActiveRooms(rooms);
        });

        socket.on('roomCreated', (roomId: string) => {
            // Navigate to the room after successful creation
            navigate(`/room/${roomId}`, { state: { justCreated: true } });
        });

        return () => {
            socket.off('roomList');
            socket.off('roomCreated');
        };
    }, [socket, navigate]);

    const handleCreateRoom = () => {
        if (socket && username) {
            const newRoomId = Math.random().toString(36).substring(2, 8);
            socket.emit('createRoom', { roomId: newRoomId, username });
            // Navigation will happen in the roomCreated event handler
        }
    };

    const handleJoinRoom = (roomId: string) => {
        navigate(`/room/${roomId}`);
    };

    return (
        <div className="lobby-view">
            <RoomList rooms={activeRooms} onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} />
        </div>
    );
}; 
