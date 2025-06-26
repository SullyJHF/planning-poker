import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useSocket } from '../../contexts/SocketContext';
import { useUsername } from '../../contexts/UsernameContext';
import { RoomView } from '../RoomView';
import { ConnectionStatus } from '../ConnectionStatus';
import { RoomSettings } from '../RoomSettings';
import { CloseButton } from '../CloseButton';
import { Button } from '../Button';
import { AppHeader } from '../AppHeader';

export const RoomRoute: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { socket, roomId: socketRoomId } = useSocket();
    const { username, clearUsername } = useUsername();
    const [roomExists, setRoomExists] = useState<boolean | null>(null);
    const [isLeaving, setIsLeaving] = useState(false);
    const [needsPassword, setNeedsPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [jiraBaseUrl, setJiraBaseUrl] = useState<string>('');
    const [isPrivateRoom, setIsPrivateRoom] = useState<boolean>(false);
    const [roomPassword, setRoomPassword] = useState<string>('');
    
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

    const attemptJoinRoom = useCallback((passwordAttempt?: string) => {
        if (!socket || !roomId || !username) return;
        
        setIsJoining(true);
        socket.emit('joinRoom', { roomId, username, password: passwordAttempt });
        
        // Listen for join failure (room needs password or wrong password)
        const handleJoinFailure = () => {
            setIsJoining(false);
            setNeedsPassword(true);
            socket.off('roomJoined', handleJoinSuccess);
            socket.off('error', handleJoinFailure);
        };
        
        const handleJoinSuccess = () => {
            setIsJoining(false);
            setNeedsPassword(false);
            setPassword('');
            socket.off('roomJoined', handleJoinSuccess);
            socket.off('error', handleJoinFailure);
        };
        
        socket.once('roomJoined', handleJoinSuccess);
        socket.once('error', handleJoinFailure);
    }, [socket, roomId, username]);

    const handlePasswordSubmit = () => {
        if (password.trim()) {
            attemptJoinRoom(password);
        }
    };

    const handlePasswordCancel = () => {
        setNeedsPassword(false);
        setPassword('');
        navigate('/', { replace: true });
    };

    const handleCopyLink = async () => {
        const roomUrl = `${window.location.origin}/room/${roomId}`;
        try {
            await navigator.clipboard.writeText(roomUrl);
            toast.success('Room link copied to clipboard!', {
                autoClose: 2000,
            });
        } catch (err) {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = roomUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Room link copied to clipboard!', {
                autoClose: 2000,
            });
        }
    };

    const handleUpdateJiraBaseUrl = (newJiraBaseUrl: string) => {
        if (socket && socketRoomId && isHost) {
            socket.emit('updateJiraBaseUrl', { roomId: socketRoomId, jiraBaseUrl: newJiraBaseUrl });
        }
    };

    const handleUpdateRoomPassword = (newPassword: string) => {
        if (socket && socketRoomId && isHost) {
            socket.emit('updateRoomPassword', { roomId: socketRoomId, password: newPassword });
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
        
        if (socket && roomId && username && roomExists && !socketRoomId && !isLeaving && (!needsPassword || justCreated)) {
            console.log('RoomRoute: Emitting joinRoom event');
            attemptJoinRoom();
        }
    }, [socket, roomId, username, roomExists, socketRoomId, isLeaving, needsPassword, attemptJoinRoom, justCreated]);

    // Listen for room state updates to get host status and room settings
    useEffect(() => {
        if (!socket || !socketRoomId) return;

        const handleRoomState = (data: { 
            hostId: string; 
            jiraBaseUrl?: string;
            isPrivate?: boolean;
            password?: string;
        }) => {
            console.log('RoomRoute: handleRoomState', {
                hostId: data.hostId,
                socketId: socket.id,
                isHost: data.hostId === socket.id,
                isPrivate: data.isPrivate
            });
            setIsHost(data.hostId === socket.id);
            if (data.jiraBaseUrl !== undefined) {
                setJiraBaseUrl(data.jiraBaseUrl);
            }
            if (data.isPrivate !== undefined) {
                setIsPrivateRoom(data.isPrivate);
            }
            if (data.password !== undefined) {
                setRoomPassword(data.password);
            }
        };

        const handleHostChanged = (newHostId: string) => {
            setIsHost(newHostId === socket.id);
        };

        const handleJiraBaseUrlUpdated = ({ jiraBaseUrl: newJiraBaseUrl }: { jiraBaseUrl: string }) => {
            setJiraBaseUrl(newJiraBaseUrl);
        };

        socket.on('roomState', handleRoomState);
        socket.on('hostChanged', handleHostChanged);
        socket.on('jiraBaseUrlUpdated', handleJiraBaseUrlUpdated);

        // Request room state immediately when listeners are set up
        socket.emit('getRoomState', { roomId: socketRoomId });

        return () => {
            socket.off('roomState', handleRoomState);
            socket.off('hostChanged', handleHostChanged);
            socket.off('jiraBaseUrlUpdated', handleJiraBaseUrlUpdated);
        };
    }, [socket, socketRoomId]);

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

    // Show password modal if room requires password
    if (needsPassword && roomExists) {
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
                        <div className="password-modal-overlay">
                            <div className="password-modal">
                                <div className="password-modal-header">
                                    <div className="password-modal-title">
                                        <FontAwesomeIcon icon={faLock} />
                                        <h3>Private Room</h3>
                                    </div>
                                    <CloseButton onClick={handlePasswordCancel} />
                                </div>
                                <div className="password-modal-content">
                                    <p>This room is password protected. Please enter the password to join.</p>
                                    <div className="password-input">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter room password"
                                            autoFocus
                                            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                            disabled={isJoining}
                                        />
                                    </div>
                                    <div className="password-modal-actions">
                                        <Button 
                                            variant="secondary" 
                                            onClick={handlePasswordCancel}
                                            disabled={isJoining}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            onClick={handlePasswordSubmit}
                                            disabled={!password.trim() || isJoining}
                                        >
                                            {isJoining ? 'Joining...' : 'Join Room'}
                                        </Button>
                                    </div>
                                </div>
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
            <AppHeader 
                username={username}
                onChangeUsername={clearUsername}
                variant="room"
                rightContent={
                    <>
                        <RoomSettings
                            isHost={isHost}
                            jiraBaseUrl={jiraBaseUrl}
                            isPrivateRoom={isPrivateRoom}
                            currentPassword={roomPassword}
                            onUpdateJiraBaseUrl={handleUpdateJiraBaseUrl}
                            onUpdateRoomPassword={handleUpdateRoomPassword}
                        />
                        <Button 
                            variant="outline" 
                            onClick={handleCopyLink}
                            title="Click to copy room link"
                        >
                            Room ID: {roomId}
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={handleLeaveRoom}
                        >
                            Leave Room
                        </Button>
                    </>
                }
            />

            <main className="App-content">
                <RoomView username={username} onLeaveRoom={handleLeaveRoom} />
            </main>
        </div>
    );
};
