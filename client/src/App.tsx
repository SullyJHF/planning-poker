import React, { useState } from 'react';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import { UsernameInput } from './components/UsernameInput';
import { ConnectionStatus } from './components/ConnectionStatus';
import { RoomView } from './components/RoomView';
import { LobbyView } from './components/LobbyView';
import './App.css';

function AppContent() {
    const { socket, roomId, setRoomId } = useSocket();
    const [username, setUsername] = useState<string>('');
    const [showUsernameInput, setShowUsernameInput] = useState(true);

    const handleUsernameSubmit = (newUsername: string) => {
        setUsername(newUsername);
        setShowUsernameInput(false);
    };

    const handleLeaveRoom = () => {
        if (socket && roomId) {
            socket.emit('leaveRoom', { roomId });
            setRoomId(null);
        }
    };

    return (
        <div className="App">
            {roomId && !showUsernameInput && (
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
            )}

            <main className="App-content">
                {!roomId ? (
                    <div className="lobby-container">
                        <div className="lobby-header">
                            <div className="lobby-title-row">
                                <h1>Planning Poker</h1>
                                <ConnectionStatus />
                            </div>
                            {!showUsernameInput && (
                                <p>Username: {username} <button onClick={() => setShowUsernameInput(true)}>Change</button></p>
                            )}
                        </div>
                        <div className="lobby-content">
                            <LobbyView username={username} />
                        </div>
                    </div>
                ) : (
                    <RoomView username={username} onLeaveRoom={handleLeaveRoom} />
                )}
            </main>

            {showUsernameInput && (
                <div className="username-overlay">
                    <div className="username-modal">
                        <h2>Enter Your Username</h2>
                        <UsernameInput onSubmit={handleUsernameSubmit} />
                    </div>
                </div>
            )}

        </div>
    );
}

function App() {
    return (
        <SocketProvider>
            <AppContent />
        </SocketProvider>
    );
}

export default App; 
