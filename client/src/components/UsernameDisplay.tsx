import React from 'react';
import { Button } from './Button';
import './UsernameDisplay.css';

interface UsernameDisplayProps {
    username: string;
    onChangeUsername: () => void;
    variant?: 'header' | 'compact';
}

export const UsernameDisplay: React.FC<UsernameDisplayProps> = ({
    username,
    onChangeUsername,
    variant = 'header'
}) => {
    if (variant === 'compact') {
        return (
            <div className="username-display username-display--compact">
                <span className="username-text">
                    Username: {username}
                </span>
                <Button 
                    variant="outline" 
                    size="small" 
                    onClick={onChangeUsername}
                >
                    Change
                </Button>
            </div>
        );
    }

    return (
        <div className="username-display">
            <span className="username-label">Username:</span>
            <span className="username-value">{username}</span>
            <Button 
                variant="outline" 
                size="small" 
                onClick={onChangeUsername}
            >
                Change
            </Button>
        </div>
    );
};