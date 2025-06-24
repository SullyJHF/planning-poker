import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSocket } from '../../contexts/SocketContext';
import { useUsername } from '../../contexts/UsernameContext';
import { RoomView } from '../RoomView';
import { ConnectionStatus } from '../ConnectionStatus';

export const RoomRoute: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { socket, roomId: socketRoomId } = useSocket();
    const { username, setShowUsernameInput } = useUsername();
    const [roomExists, setRoomExists] = useState<boolean | null>(null);
    const [isLeaving, setIsLeaving] = useState(false);
    
    // Check if we just created this room
    const justCreated = location.state?.justCreated === true;

    const handleLeaveRoom = () => {
        if (socket && socketRoomId) {
            console.log('RoomRoute: Leaving room', socketRoomId);
            setIsLeaving(true); // Prevent auto-join from triggering
            
            // Navigate immediately to prevent auto-rejoin race condition
            navigate('/');
            
            // Emit leave room event (fire and forget)
            socket.emit('leaveRoom', { roomId: socketRoomId });
        } else {
            navigate('/');
        }
    };

    // Check if room exists when component mounts (skip if we just created it)
    useEffect(() => {
        if (!socket || !roomId) return;

        // Reset isLeaving when navigating to a room
        setIsLeaving(false);

        if (justCreated) {
            // If we just created the room, assume it exists
            setRoomExists(true);
            return;
        }

        const checkRoomExists = () => {
            socket.emit('checkRoomExists', { roomId }, (exists: boolean) => {
                setRoomExists(exists);
                if (!exists) {
                    // Room doesn't exist, show error toast and redirect immediately
                    toast.error(`Room "${roomId}" does not exist or has been closed.`);
                    navigate('/', { replace: true });
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
    }, [socket, roomId, navigate, justCreated]);

    // Auto-join room when username is set and room exists
    useEffect(() => {
        console.log('RoomRoute: Auto-join check -', {
            socket: !!socket,
            roomId,
            username,
            roomExists,
            socketRoomId,
            isLeaving,
            shouldJoin: socket && roomId && username && roomExists && !socketRoomId && !isLeaving
        });
        
        if (socket && roomId && username && roomExists && !socketRoomId && !isLeaving) {
            console.log('RoomRoute: Emitting joinRoom event');
            socket.emit('joinRoom', { roomId, username });
        }
    }, [socket, roomId, username, roomExists, socketRoomId, isLeaving]);

    // Note: socketRoomId will be set automatically by SocketContext when we receive roomJoined event

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

    // If room doesn't exist, we redirect immediately with toast, so this won't be reached

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
