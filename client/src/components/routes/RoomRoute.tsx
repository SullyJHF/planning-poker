import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { useUsername } from '../../contexts/UsernameContext';
import { RoomView } from '../RoomView';
import { ConnectionStatus } from '../ConnectionStatus';

export const RoomRoute: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { socket, roomId: socketRoomId, setRoomId } = useSocket();
    const { username, setShowUsernameInput } = useUsername();
    const [roomExists, setRoomExists] = useState<boolean | null>(null);

    const handleLeaveRoom = () => {
        if (socket && socketRoomId) {
            socket.emit('leaveRoom', { roomId: socketRoomId });
            setRoomId(null);
        }
        navigate('/');
    };

    // Check if room exists when component mounts
    useEffect(() => {
        if (!socket || !roomId) return;

        const checkRoomExists = () => {
            socket.emit('checkRoomExists', { roomId }, (exists: boolean) => {
                setRoomExists(exists);
                if (!exists) {
                    // Room doesn't exist, redirect to lobby after a brief delay
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 2000);
                }
            });
        };

        if (socket.connected) {
            checkRoomExists();
        } else {
            socket.on('connect', checkRoomExists);
        }

        return () => {
            socket.off('connect', checkRoomExists);
        };
    }, [socket, roomId, navigate]);

    // Auto-join room when username is set and room exists
    useEffect(() => {
        if (socket && roomId && username && roomExists && !socketRoomId) {
            socket.emit('joinRoom', { roomId, username });
        }
    }, [socket, roomId, username, roomExists, socketRoomId]);

    // Set the room ID in socket context when we join
    useEffect(() => {
        if (roomId && socketRoomId !== roomId) {
            setRoomId(roomId);
        }
    }, [roomId, socketRoomId, setRoomId]);

    // Show loading state while checking room existence
    if (roomExists === null) {
        return (
            <div className="App">
                <main className="App-content">
                    <div className="lobby-container">
                        <div className="lobby-header">
                            <div className="lobby-title-row">
                                <h1>Planning Poker</h1>
                                <ConnectionStatus />
                            </div>
                        </div>
                        <div className="lobby-content">
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p>Checking room...</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Show error state if room doesn't exist
    if (roomExists === false) {
        return (
            <div className="App">
                <main className="App-content">
                    <div className="lobby-container">
                        <div className="lobby-header">
                            <div className="lobby-title-row">
                                <h1>Planning Poker</h1>
                                <ConnectionStatus />
                            </div>
                        </div>
                        <div className="lobby-content">
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <h2>Room Not Found</h2>
                                <p>The room "{roomId}" does not exist.</p>
                                <p>Redirecting to lobby...</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // If no username is set, show loading state (username input will be handled by App)
    if (!username) {
        return (
            <div className="App">
                <main className="App-content">
                    <div className="lobby-container">
                        <div className="lobby-header">
                            <div className="lobby-title-row">
                                <h1>Planning Poker</h1>
                                <ConnectionStatus />
                            </div>
                            <p>Joining room: {roomId}</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Show room view when everything is ready
    return (
        <div className="App">
            <header className="App-header">
                <div className="header-left">
                    <h1>Planning Poker</h1>
                    <ConnectionStatus />
                </div>
                <div className="header-center">
                    <div className="username-display">
                        <span className="username-label">Username:</span>
                        <span className="username-value">{username}</span>
                        <button className="change-username-btn" onClick={() => setShowUsernameInput(true)}>
                            Change
                        </button>
                    </div>
                </div>
                <div className="header-right">
                    <span className="room-id">Room ID: {roomId}</span>
                    <button className="leave-room-btn" onClick={handleLeaveRoom}>
                        Leave Room
                    </button>
                </div>
            </header>

            <main className="App-content">
                <RoomView username={username} onLeaveRoom={handleLeaveRoom} />
            </main>
        </div>
    );
};