import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CardDeck, CardValue } from './components/CardDeck';
import { UsernameInput } from './components/UsernameInput';
import { Room, RoomList } from './components/RoomList';
import './App.css';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
const CONNECTION_CHECK_INTERVAL = 5000; // Check every 5 seconds
const PING_TIMEOUT = 2000; // Wait 2 seconds for pong response

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
    const [activeRooms, setActiveRooms] = useState<Room[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [hostId, setHostId] = useState<string>('');

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

        newSocket.on('pong', () => {
            setConnected(true);
        });

        // Set up periodic connection check
        const checkConnection = () => {
            if (newSocket) {
                // Set a timeout to mark as disconnected if no pong received
                const timeoutId = setTimeout(() => {
                    setConnected(false);
                }, PING_TIMEOUT);

                // Send ping and clear timeout if pong received
                newSocket.emit('ping', (response: boolean) => {
                    if (response) {
                        setConnected(true);
                        clearTimeout(timeoutId);
                    }
                });
            }
        };

        const intervalId = setInterval(checkConnection, CONNECTION_CHECK_INTERVAL);

        newSocket.on('roomList', (rooms: Room[]) => {
            setActiveRooms(rooms);
        });

        newSocket.on('roomState', (data: { users: User[]; hostId: string; }) => {
            setUsers(data.users);
            setHostId(data.hostId);
            setIsHost(data.hostId === newSocket.id);
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

        newSocket.on('hostChanged', (newHostId: string) => {
            setHostId(newHostId);
            setIsHost(newHostId === newSocket.id);
        });

        return () => {
            clearInterval(intervalId);
            newSocket.close();
            setConnected(false);
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

    const handleLeaveRoom = () => {
        if (socket && roomId) {
            socket.emit('leaveRoom', { roomId });
            setRoomId('');
            setVotes({});
            setSelectedCard(undefined);
        }
    };

    const handleTransferHost = (newHostId: string) => {
        if (socket && roomId && isHost) {
            socket.emit('transferHost', { roomId, newHostId });
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
                <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
                    <i className={`fas fa-circle ${connected ? 'fa-bounce' : ''}`}></i>
                    {connected ? 'Connected' : 'Disconnected'}
                </div>
                <h1>Planning Poker</h1>
                <p>Username: {username} <button onClick={() => setShowUsernameInput(true)}>Change</button></p>

                {!roomId ? (
                    <div className="room-controls">
                        <button onClick={handleCreateRoom}>Create New Room</button>
                        <RoomList rooms={activeRooms} onJoinRoom={handleJoinRoom} />
                    </div>
                ) : (
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
                        <button className="leave-room-btn" onClick={handleLeaveRoom}>
                            Leave Room
                        </button>
                    </>
                )}
            </header>
        </div>
    );
}

export default App; 
