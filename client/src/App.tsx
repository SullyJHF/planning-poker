import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { SocketProvider } from './contexts/SocketContext';
import { UsernameProvider, useUsername } from './contexts/UsernameContext';
import { UsernameInput } from './components/UsernameInput';
import { LobbyRoute } from './components/routes/LobbyRoute';
import { RoomRoute } from './components/routes/RoomRoute';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function AppContent() {
    const { username, setUsername, showUsernameInput, setShowUsernameInput, isLoading } = useUsername();

    const handleUsernameSubmit = (newUsername: string) => {
        setUsername(newUsername);
        setShowUsernameInput(false);
    };

    // Show loading spinner while checking for cached username
    if (isLoading) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

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
                        <UsernameInput 
                            onSubmit={handleUsernameSubmit} 
                            initialUsername={username}
                        />
                    </div>
                </div>
            )}
            
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
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
