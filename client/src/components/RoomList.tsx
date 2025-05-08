import React from 'react';
import './RoomList.css';

export interface Room {
    id: string;
    userCount: number;
    hostUsername: string;
}

interface RoomListProps {
    rooms: Room[];
    onJoinRoom: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ rooms, onJoinRoom }) => {
    if (rooms.length === 0) {
        return (
            <div className="room-list empty">
                <p>No active rooms. Create one to get started!</p>
            </div>
        );
    }

    return (
        <div className="room-list">
            <h3>Active Rooms</h3>
            <div className="rooms">
                {rooms.map(room => (
                    <button
                        key={room.id}
                        className="room-item"
                        onClick={() => onJoinRoom(room.id)}
                    >
                        <div className="room-info">
                            <span className="host">Host: {room.hostUsername}</span>
                            <span className="room-id">Room: {room.id}</span>
                        </div>
                        <span className="user-count">{room.userCount} {room.userCount === 1 ? 'player' : 'players'}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}; 
