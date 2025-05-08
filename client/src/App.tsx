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
            <header className="App-header">
                <ConnectionStatus />
                <h1>Planning Poker</h1>
                {!showUsernameInput && (
                    <p>Username: {username} <button onClick={() => setShowUsernameInput(true)}>Change</button></p>
                )}

                {!roomId ? (
                    <LobbyView username={username} />
                ) : (
                    <RoomView username={username} onLeaveRoom={handleLeaveRoom} />
                )}
            </header>

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
