import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CardDeck, CardValue } from './components/CardDeck';
import { UsernameInput } from './components/UsernameInput';
import './App.css';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

interface User {
    id: string;
    username: string;
}

interface Vote {
    value: string;
    username: string;
}

function App() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [roomId, setRoomId] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [selectedCard, setSelectedCard] = useState<CardValue>();
    const [votes, setVotes] = useState<Record<string, Vote>>({});
    const [users, setUsers] = useState<User[]>([]);
    const [showUsernameInput, setShowUsernameInput] = useState(true);

    useEffect(() => {
        const newSocket = io(SERVER_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setConnected(true);
            console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
            setConnected(false);
            console.log('Disconnected from server');
        });

        newSocket.on('roomState', (data: { users: User[]; }) => {
            setUsers(data.users);
        });

        newSocket.on('votesUpdated', (newVotes: Record<string, Vote>) => {
            setVotes(newVotes);
        });

        newSocket.on('userJoined', (user: User) => {
            console.log(`User joined: ${user.username}`);
        });

        newSocket.on('usernameUpdated', (user: User) => {
            console.log(`Username updated: ${user.username}`);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const handleUsernameSubmit = (newUsername: string) => {
        setUsername(newUsername);
        setShowUsernameInput(false);
    };

    const handleCreateRoom = () => {
        if (socket && username) {
            const newRoomId = Math.random().toString(36).substring(2, 8);
            socket.emit('createRoom', { roomId: newRoomId, username });
            setRoomId(newRoomId);
        }
    };

    const handleJoinRoom = (roomId: string) => {
        if (socket && username) {
            socket.emit('joinRoom', { roomId, username });
            setRoomId(roomId);
        }
    };

    const handleSelectCard = (value: CardValue) => {
        if (socket && roomId) {
            setSelectedCard(value);
            socket.emit('vote', { roomId, value });
        }
    };

    const handleUpdateUsername = (newUsername: string) => {
        if (socket && roomId) {
            socket.emit('updateUsername', { roomId, username: newUsername });
            setUsername(newUsername);
        }
    };

    if (showUsernameInput) {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Planning Poker</h1>
                    <UsernameInput onSubmit={handleUsernameSubmit} />
                </header>
            </div>
        );
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Planning Poker</h1>
                <p>Connection status: {connected ? 'Connected' : 'Disconnected'}</p>
                <p>Username: {username} <button onClick={() => setShowUsernameInput(true)}>Change</button></p>

                {!roomId ? (
                    <div className="room-controls">
                        <button onClick={handleCreateRoom}>Create New Room</button>
                        <div className="join-room">
                            <input
                                type="text"
                                placeholder="Enter Room ID"
                                onChange={(e) => handleJoinRoom(e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <p>Room ID: {roomId}</p>
                        <div className="users-list">
                            <h3>Users in Room:</h3>
                            {users.map(user => (
                                <div key={user.id} className="user">
                                    {user.username} {user.id === socket?.id && '(You)'}
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
                    </>
                )}
            </header>
        </div>
    );
}

export default App; 
