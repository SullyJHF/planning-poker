import React from 'react';
import { useUsername } from '../../contexts/UsernameContext';
import { LobbyView } from '../LobbyView';
import { ConnectionStatus } from '../ConnectionStatus';

export const LobbyRoute: React.FC = () => {
    const { username, setShowUsernameInput } = useUsername();

    return (
        <div className="App">
            <main className="App-content">
                <div className="lobby-container">
                    <div className="lobby-header">
                        <div className="lobby-title-row">
                            <h1>Planning Poker</h1>
                            <ConnectionStatus />
                        </div>
                        {username && (
                            <p>Username: {username} <button onClick={() => setShowUsernameInput(true)}>Change</button></p>
                        )}
                    </div>
                    <div className="lobby-content">
                        <LobbyView username={username} />
                    </div>
                </div>
            </main>
        </div>
    );
};