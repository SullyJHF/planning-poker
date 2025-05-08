import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { CardDeck, CardValue } from './CardDeck';
import './RoomView.css';

interface User {
    id: string;
    username: string;
}

interface Vote {
    value: string;
    username: string;
}

export const RoomView: React.FC<{ username: string; onLeaveRoom: () => void; }> = ({ username, onLeaveRoom }) => {
    const { socket, roomId } = useSocket();
    const [selectedCard, setSelectedCard] = useState<CardValue>();
    const [votes, setVotes] = useState<Record<string, Vote>>({});
    const [users, setUsers] = useState<User[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [hostId, setHostId] = useState<string>('');

    useEffect(() => {
        if (!socket) return;

        socket.on('roomState', (data: { users: User[]; hostId: string; }) => {
            setUsers(data.users);
            setHostId(data.hostId);
            setIsHost(data.hostId === socket.id);
        });

        socket.on('votesUpdated', (newVotes: Record<string, Vote>) => {
            setVotes(newVotes);
        });

        socket.on('hostChanged', (newHostId: string) => {
            setHostId(newHostId);
            setIsHost(newHostId === socket.id);
        });

        return () => {
            socket.off('roomState');
            socket.off('votesUpdated');
            socket.off('hostChanged');
        };
    }, [socket]);

    const handleSelectCard = (value: CardValue) => {
        if (socket && roomId) {
            setSelectedCard(value);
            socket.emit('vote', { roomId, value });
        }
    };

    const handleTransferHost = (newHostId: string) => {
        if (socket && roomId && isHost) {
            socket.emit('transferHost', { roomId, newHostId });
        }
    };

    return (
        <>
            <p>Room ID: {roomId}</p>
            <div className="users-list">
                <h3>Players in Room:</h3>
                {users.map(user => (
                    <div key={user.id} className="user">
                        {user.username} {user.id === socket?.id && '(You)'}
                        {isHost && user.id !== socket?.id && (
                            <button
                                className="transfer-host-btn"
                                onClick={() => handleTransferHost(user.id)}
                                title="Make host"
                            >
                                <i className="fas fa-crown"></i>
                            </button>
                        )}
                        {user.id === hostId && (
                            <span className="host-badge" title="Room host">
                                <i className="fas fa-crown"></i>
                            </span>
                        )}
                    </div>
                ))}
            </div>
            <CardDeck onSelectCard={handleSelectCard} selectedCard={selectedCard} />
            <div className="votes">
                <h3>Votes:</h3>
                {Object.entries(votes).map(([userId, vote]) => (
                    <div key={userId} className="vote">
                        {vote.username}: {vote.value}
                    </div>
                ))}
            </div>
            <button className="leave-room-btn" onClick={onLeaveRoom}>
                Leave Room
            </button>
        </>
    );
}; 
