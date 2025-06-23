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

        socket.on('roomList', (rooms: Room[]) => {
            setActiveRooms(rooms);
        });

        return () => {
            socket.off('roomList');
        };
    }, [socket]);

    const handleCreateRoom = () => {
        if (socket && username) {
            const newRoomId = Math.random().toString(36).substring(2, 8);
            socket.emit('createRoom', { roomId: newRoomId, username });
            navigate(`/room/${newRoomId}`);
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
