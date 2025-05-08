import React from 'react';
import { useSocket } from '../contexts/SocketContext';
import './ConnectionStatus.css';

export const ConnectionStatus: React.FC = () => {
    const { connected } = useSocket();

    return (
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <i className={`fas fa-circle ${connected ? 'fa-bounce' : ''}`}></i>
            {connected ? 'Connected' : 'Disconnected'}
        </div>
    );
}; 
