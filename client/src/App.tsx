import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { UsernameProvider, useUsername } from './contexts/UsernameContext';
import { UsernameInput } from './components/UsernameInput';
import { LobbyRoute } from './components/routes/LobbyRoute';
import { RoomRoute } from './components/routes/RoomRoute';
import './App.css';

function AppContent() {
    const { setUsername, showUsernameInput, setShowUsernameInput } = useUsername();

    const handleUsernameSubmit = (newUsername: string) => {
        setUsername(newUsername);
        setShowUsernameInput(false);
    };

    return (
        <>
            <Routes>
                <Route path="/" element={<LobbyRoute />} />
                <Route path="/room/:roomId" element={<RoomRoute />} />
            </Routes>

            {showUsernameInput && (
                <div className="username-overlay">
                    <div className="username-modal">
                        <h2>Enter Your Username</h2>
                        <UsernameInput onSubmit={handleUsernameSubmit} />
                    </div>
                </div>
            )}
        </>
    );
}

function App() {
    return (
        <SocketProvider>
            <UsernameProvider>
                <Router>
                    <AppContent />
                </Router>
            </UsernameProvider>
        </SocketProvider>
    );
}

export default App; 
