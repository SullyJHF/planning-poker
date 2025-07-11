import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from './IconButton';
import { Button } from './Button';
import { Modal } from './Modal';
import './RoomList.css';

export interface Room {
    id: string;
    userCount: number;
    hostUsername: string;
}

interface RoomListProps {
    rooms: Room[];
    onJoinRoom: (roomId: string) => void;
    onCreateRoom: (isPrivate: boolean, password?: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ rooms, onJoinRoom, onCreateRoom }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');

    const handleCreateRoom = () => {
        onCreateRoom(isPrivate, isPrivate ? password : undefined);
        setShowCreateModal(false);
        setIsPrivate(false);
        setPassword('');
    };

    const handleCancel = () => {
        setShowCreateModal(false);
        setIsPrivate(false);
        setPassword('');
    };

    return (
        <div className="room-list">
            <div className="room-list-header">
                <h3>Active Rooms</h3>
                <IconButton 
                    icon={faPlus}
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    title="Create new room"
                />
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

            <Modal
                isOpen={showCreateModal}
                onClose={handleCancel}
                title="Create New Room"
                size="small"
            >
                <div className="room-type-toggle">
                    <button 
                        className={`toggle-btn ${!isPrivate ? 'active' : ''}`}
                        onClick={() => setIsPrivate(false)}
                    >
                        <FontAwesomeIcon icon={faLockOpen} />
                        Public Room
                    </button>
                    <button 
                        className={`toggle-btn ${isPrivate ? 'active' : ''}`}
                        onClick={() => setIsPrivate(true)}
                    >
                        <FontAwesomeIcon icon={faLock} />
                        Private Room
                    </button>
                </div>

                {isPrivate && (
                    <div className="password-input">
                        <label htmlFor="room-password">Room Password</label>
                        <input
                            id="room-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                            placeholder="Enter password for private room"
                            autoFocus
                        />
                    </div>
                )}

                <div className="modal-actions">
                    <Button variant="secondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleCreateRoom}
                        disabled={isPrivate && !password.trim()}
                    >
                        Create Room
                    </Button>
                </div>
            </Modal>
        </div>
    );
}; 
