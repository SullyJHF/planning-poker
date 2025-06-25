import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCachedUsername, saveCachedUsername, clearCachedUsername, isUsernameFromUrl } from '../utils/usernameStorage';

interface UsernameContextType {
    username: string;
    setUsername: (username: string) => void;
    clearUsername: () => void;
    showUsernameInput: boolean;
    setShowUsernameInput: (show: boolean) => void;
    isLoading: boolean;
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
    const [showUsernameInput, setShowUsernameInput] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Initialize username from cache/URL on mount
    useEffect(() => {
        const initializeUsername = async () => {
            const startTime = Date.now();
            const MINIMUM_LOADING_TIME = 500; // 500ms minimum loading duration
            
            // Check for cached username
            const cachedUsername = getCachedUsername();
            if (cachedUsername) {
                setUsernameState(cachedUsername);
                setShowUsernameInput(false);
            } else {
                setShowUsernameInput(true);
            }
            
            // Calculate remaining time to reach minimum loading duration
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);
            
            // Wait for remaining time to ensure consistent 500ms loading experience
            await new Promise(resolve => setTimeout(resolve, remainingTime));
            
            setIsLoading(false);
        };

        initializeUsername();
    }, []);

    // Enhanced setUsername that also saves to localStorage
    const setUsername = (newUsername: string) => {
        const trimmedUsername = newUsername.trim();
        setUsernameState(trimmedUsername);
        
        // Always clear the old cached username first, then save the new one
        // Only save to localStorage if not from URL parameter (to avoid overriding cache during testing)
        if (trimmedUsername && !isUsernameFromUrl()) {
            clearCachedUsername(); // Clear old value first
            saveCachedUsername(trimmedUsername);
        }
    };

    // Show username input modal (for changing username)
    const clearUsername = () => {
        // Don't clear the username state yet - keep it for pre-filling the modal
        // Only clear localStorage and show modal
        setShowUsernameInput(true);
    };

    return (
        <UsernameContext.Provider value={{
            username,
            setUsername,
            clearUsername,
            showUsernameInput,
            setShowUsernameInput,
            isLoading
        }}>
            {children}
        </UsernameContext.Provider>
    );
};