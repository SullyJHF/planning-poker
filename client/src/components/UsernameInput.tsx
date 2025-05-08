import React, { useState, useRef, useEffect } from 'react';
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
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus the input field when the component mounts
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onSubmit(username.trim());
        }
    };

    return (
        <form className="username-form" onSubmit={handleSubmit}>
            <input
                ref={inputRef}
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
