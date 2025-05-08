import React, { useState } from 'react';
import './UsernameInput.css';

interface UsernameInputProps {
    onSubmit: (username: string) => void;
    initialUsername?: string;
    buttonText?: string;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({
    onSubmit,
    initialUsername = '',
    buttonText = 'Submit'
}) => {
    const [username, setUsername] = useState(initialUsername);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onSubmit(username.trim());
        }
    };

    return (
        <form className="username-form" onSubmit={handleSubmit}>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                minLength={2}
                maxLength={20}
            />
            <button type="submit">{buttonText}</button>
        </form>
    );
}; 
