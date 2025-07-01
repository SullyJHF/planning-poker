import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { SocketProvider } from './contexts/SocketContext';
import { UsernameProvider, useUsername } from './contexts/UsernameContext';
import { UsernameInput } from './components/UsernameInput';
import { Modal } from './components/Modal';
import { LobbyRoute } from './components/routes/LobbyRoute';
import { RoomRoute } from './components/routes/RoomRoute';
import { getCachedUsername } from './utils/usernameStorage';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function AppContent() {
    const { username, setUsername, showUsernameInput, setShowUsernameInput, isLoading } = useUsername();

    const handleUsernameSubmit = (newUsername: string) => {
        setUsername(newUsername);
        setShowUsernameInput(false);
    };

    const handleUsernameCancel = () => {
        // Only allow cancelling if there's already a cached username
        const cachedUsername = getCachedUsername();
        if (cachedUsername) {
            setShowUsernameInput(false);
        }
    };

    // Check if user has a cached username to determine if modal can be closed
    const hasCachedUsername = Boolean(getCachedUsername());
    const canCloseUsernameModal = hasCachedUsername;

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

            <Modal
                isOpen={showUsernameInput}
                onClose={canCloseUsernameModal ? handleUsernameCancel : undefined}
                title="Enter Your Username"
                size="small"
                showCloseButton={canCloseUsernameModal}
                allowBackdropClose={canCloseUsernameModal}
            >
                <UsernameInput
                    onSubmit={handleUsernameSubmit}
                    initialUsername={username}
                    onCancel={canCloseUsernameModal ? handleUsernameCancel : undefined}
                />
            </Modal>

            <ToastContainer
                position="bottom-right"
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
