import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import './UsernameInput.css';

interface UsernameInputProps {
    onSubmit: (username: string) => void;
    onCancel?: () => void;
    initialUsername?: string;
    buttonText?: string;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({
    onSubmit,
    onCancel,
    initialUsername = '',
    buttonText = 'Submit'
}) => {
    const [username, setUsername] = useState(initialUsername);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus the input field when the component mounts
        inputRef.current?.focus();
        // Also select all text for easy replacement when editing existing username
        if (initialUsername) {
            inputRef.current?.select();
        }
    }, [initialUsername]);

    // Update username state when initialUsername prop changes
    useEffect(() => {
        setUsername(initialUsername);
    }, [initialUsername]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onSubmit(username.trim());
        }
    };

    return (
        <form className="username-form" onSubmit={handleSubmit}>
            <div className="username-section">
                <div className="username-item">
                    <label htmlFor="username-input">Username</label>
                    <input
                        id="username-input"
                        ref={inputRef}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                        minLength={2}
                        maxLength={20}
                    />
                </div>
            </div>
            
            <div className="username-modal-actions">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" variant="primary">
                    {buttonText}
                </Button>
            </div>
        </form>
    );
}; 
