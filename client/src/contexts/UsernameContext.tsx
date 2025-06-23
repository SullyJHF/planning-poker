import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UsernameContextType {
    username: string;
    setUsername: (username: string) => void;
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
    const [username, setUsername] = useState<string>('');
    const [showUsernameInput, setShowUsernameInput] = useState<boolean>(true);

    return (
        <UsernameContext.Provider value={{
            username,
            setUsername,
            showUsernameInput,
            setShowUsernameInput
        }}>
            {children}
        </UsernameContext.Provider>
    );
};