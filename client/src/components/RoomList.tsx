import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './RoomList.css';

export interface Room {
    id: string;
    userCount: number;
    hostUsername: string;
}

interface RoomListProps {
    rooms: Room[];
    onJoinRoom: (roomId: string) => void;
    onCreateRoom: () => void;
}

export const RoomList: React.FC<RoomListProps> = ({ rooms, onJoinRoom, onCreateRoom }) => {
    return (
        <div className="room-list">
            <div className="room-list-header">
                <h3>Active Rooms</h3>
                <button 
                    className="create-room-btn"
                    onClick={onCreateRoom}
                    title="Create new room"
                >
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            </div>
            
            <div className="rooms-container">
                {rooms.length === 0 ? (
                    <div className="no-rooms">
                        Click + to create your first room
                    </div>
                ) : (
                    <div className="rooms">
                        {rooms.map(room => (
                            <button
                                key={room.id}
                                className="room-item"
                                onClick={() => onJoinRoom(room.id)}
                            >
                                <div className="room-info">
                                    <span className="host">Host: {room.hostUsername}</span>
                                    <span className="room-id">Room ID: {room.id}</span>
                                </div>
                                <span className="user-count">{room.userCount} {room.userCount === 1 ? 'player' : 'players'}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}; 
