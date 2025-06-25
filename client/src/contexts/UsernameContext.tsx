import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCachedUsername, saveCachedUsername, clearCachedUsername, isUsernameFromUrl } from '../utils/usernameStorage';

interface UsernameContextType {
    username: string;
    setUsername: (username: string) => void;
    clearUsername: () => void;
    showUsernameInput: boolean;
    setShowUsernameInput: (show: boolean) => void;
}

const UsernameContext = createContext<UsernameContextType | undefined>(undefined);

export const useUsername = () => {
    const context = useContext(UsernameContext);
    if (context === undefined) {
        throw new Error('useUsername must be used within a UsernameProvider');
    }
    return context;
};

interface UsernameProviderProps {
    children: ReactNode;
}

export const UsernameProvider: React.FC<UsernameProviderProps> = ({ children }) => {
    const [username, setUsernameState] = useState<string>('');
    const [showUsernameInput, setShowUsernameInput] = useState<boolean>(true);

    // Initialize username from cache/URL on mount
    useEffect(() => {
        const cachedUsername = getCachedUsername();
        if (cachedUsername) {
            setUsernameState(cachedUsername);
            setShowUsernameInput(false);
        }
    }, []);

    // Enhanced setUsername that also saves to localStorage
    const setUsername = (newUsername: string) => {
        const trimmedUsername = newUsername.trim();
        setUsernameState(trimmedUsername);
        
        // Only save to localStorage if not from URL parameter (to avoid overriding cache during testing)
        if (trimmedUsername && !isUsernameFromUrl()) {
            saveCachedUsername(trimmedUsername);
        }
    };

    // Clear username and show input modal
    const clearUsername = () => {
        setUsernameState('');
        clearCachedUsername();
        setShowUsernameInput(true);
    };

    return (
        <UsernameContext.Provider value={{
            username,
            setUsername,
            clearUsername,
            showUsernameInput,
            setShowUsernameInput
        }}>
            {children}
        </UsernameContext.Provider>
    );
};