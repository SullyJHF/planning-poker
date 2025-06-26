import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { UsernameDisplay } from './UsernameDisplay';
import './AppHeader.css';

interface AppHeaderProps {
    username?: string;
    onChangeUsername: () => void;
    rightContent?: React.ReactNode;
    variant?: 'lobby' | 'room';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    username,
    onChangeUsername,
    rightContent,
    variant = 'lobby'
}) => {
    const headerClass = variant === 'room' ? 'App-header' : 'lobby-header';
    
    if (variant === 'room') {
        return (
            <header className={headerClass}>
                <div className="header-left">
                    <h1>Planning Poker</h1>
                    <ConnectionStatus />
                </div>
                <div className="header-center">
                    {username && (
                        <UsernameDisplay 
                            username={username}
                            onChangeUsername={onChangeUsername}
                        />
                    )}
                </div>
                <div className="header-right">
                    {rightContent}
                </div>
            </header>
        );
    }

    return (
        <div className={headerClass}>
            <div className="lobby-title-row">
                <h1>Planning Poker</h1>
                <ConnectionStatus />
            </div>
            {username && (
                <UsernameDisplay 
                    username={username}
                    onChangeUsername={onChangeUsername}
                    variant="compact"
                />
            )}
        </div>
    );
};