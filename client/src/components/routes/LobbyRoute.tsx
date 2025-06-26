import React from 'react';
import { useUsername } from '../../contexts/UsernameContext';
import { LobbyView } from '../LobbyView';
import { AppHeader } from '../AppHeader';

export const LobbyRoute: React.FC = () => {
    const { username, setShowUsernameInput } = useUsername();

    return (
        <div className="App">
            <main className="App-content">
                <div className="lobby-container">
                    <AppHeader 
                        username={username}
                        onChangeUsername={() => setShowUsernameInput(true)}
                        variant="lobby"
                    />
                    <div className="lobby-content">
                        <LobbyView username={username} />
                    </div>
                </div>
            </main>
        </div>
    );
};