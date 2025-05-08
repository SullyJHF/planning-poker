import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CardDeck, CardValue } from './components/CardDeck';
import './App.css';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function App() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [roomId, setRoomId] = useState<string>('');
    const [selectedCard, setSelectedCard] = useState<CardValue>();
    const [votes, setVotes] = useState<Record<string, CardValue>>({});

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

        newSocket.on('vote', (data: { userId: string; value: CardValue; }) => {
            setVotes(prev => ({ ...prev, [data.userId]: data.value }));
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const handleCreateRoom = () => {
        if (socket) {
            const newRoomId = Math.random().toString(36).substring(2, 8);
            socket.emit('createRoom', newRoomId);
            setRoomId(newRoomId);
        }
    };

    const handleJoinRoom = (roomId: string) => {
        if (socket) {
            socket.emit('joinRoom', roomId);
            setRoomId(roomId);
        }
    };

    const handleSelectCard = (value: CardValue) => {
        if (socket && roomId) {
            setSelectedCard(value);
            socket.emit('vote', { roomId, value });
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Planning Poker</h1>
                <p>Connection status: {connected ? 'Connected' : 'Disconnected'}</p>

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
                        <CardDeck onSelectCard={handleSelectCard} selectedCard={selectedCard} />
                        <div className="votes">
                            <h3>Votes:</h3>
                            {Object.entries(votes).map(([userId, value]) => (
                                <div key={userId} className="vote">
                                    User {userId}: {value}
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
