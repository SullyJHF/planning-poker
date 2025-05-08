import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
const CONNECTION_CHECK_INTERVAL = 5000;
const PING_TIMEOUT = 2000;

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    roomId: string | null;
    setRoomId: (id: string | null) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);

    useEffect(() => {
        const newSocket = io(SERVER_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setConnected(true);
            console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
            setConnected(false);
            console.log('Disconnected from server');
        });

        newSocket.on('connect_error', (error) => {
            setConnected(false);
            console.log('Connection error:', error);
        });

        newSocket.on('reconnect_attempt', () => {
            setConnected(false);
            console.log('Attempting to reconnect...');
        });

        newSocket.on('reconnect_failed', () => {
            setConnected(false);
            console.log('Failed to reconnect');
        });

        // Set up periodic connection check
        const checkConnection = () => {
            if (newSocket) {
                const timeoutId = setTimeout(() => {
                    setConnected(false);
                }, PING_TIMEOUT);

                newSocket.emit('ping', (response: boolean) => {
                    if (response) {
                        setConnected(true);
                        clearTimeout(timeoutId);
                    }
                });
            }
        };

        const intervalId = setInterval(checkConnection, CONNECTION_CHECK_INTERVAL);

        return () => {
            clearInterval(intervalId);
            newSocket.close();
            setConnected(false);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected, roomId, setRoomId }}>
            {children}
        </SocketContext.Provider>
    );
}; 
