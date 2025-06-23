import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faLink } from '@fortawesome/free-solid-svg-icons';
import { useSocket } from '../contexts/SocketContext';
import { CardDeck, CardValue } from './CardDeck';
import { TaskList, Task } from './TaskList';
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
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentTaskId, setCurrentTaskId] = useState<string>();
    const [currentTask, setCurrentTask] = useState<Task | null>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('roomState', (data: { users: User[]; hostId: string; tasks: Task[]; currentTaskId?: string; }) => {
            setUsers(data.users);
            setHostId(data.hostId);
            setIsHost(data.hostId === socket.id);
            setTasks(data.tasks || []);
            setCurrentTaskId(data.currentTaskId);
            setCurrentTask(data.currentTaskId ? data.tasks?.find(t => t.id === data.currentTaskId) || null : null);
        });

        socket.on('votesUpdated', (newVotes: Record<string, Vote>) => {
            setVotes(newVotes);
        });

        socket.on('hostChanged', (newHostId: string) => {
            setHostId(newHostId);
            setIsHost(newHostId === socket.id);
        });

        socket.on('tasksUpdated', (data: { tasks: Task[]; currentTaskId?: string; }) => {
            setTasks(data.tasks);
            setCurrentTaskId(data.currentTaskId);
            setCurrentTask(data.currentTaskId ? data.tasks.find(t => t.id === data.currentTaskId) || null : null);
        });

        return () => {
            socket.off('roomState');
            socket.off('votesUpdated');
            socket.off('hostChanged');
            socket.off('tasksUpdated');
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

    const handleCreateTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
        if (socket && roomId && isHost) {
            socket.emit('createTask', { roomId, task });
        }
    };

    const handleUpdateTask = (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
        if (socket && roomId && isHost) {
            socket.emit('updateTask', { roomId, taskId, updates });
        }
    };

    const handleDeleteTask = (taskId: string) => {
        if (socket && roomId && isHost) {
            socket.emit('deleteTask', { roomId, taskId });
        }
    };

    const handleSetCurrentTask = (taskId: string) => {
        if (socket && roomId && isHost) {
            socket.emit('setCurrentTask', { roomId, taskId });
            setSelectedCard(undefined);
        }
    };

    return (
        <div className="room-container">
            <div className="room-content">
                <div className="left-sidebar">
                    <div className="users-list">
                        <h3>Players ({users.length})</h3>
                        <div className="users-container">
                            {users.map(user => (
                                <div key={user.id} className="user">
                                    <span className="user-name">
                                        {user.username} {user.id === socket?.id && '(You)'}
                                    </span>
                                    {isHost && user.id !== socket?.id && (
                                        <button
                                            className="transfer-host-btn"
                                            onClick={() => handleTransferHost(user.id)}
                                            title="Make host"
                                        >
                                            <FontAwesomeIcon icon={faCrown} />
                                        </button>
                                    )}
                                    {user.id === hostId && (
                                        <span className="host-badge" title="Room host">
                                            <FontAwesomeIcon icon={faCrown} />
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="center-content">
                    {currentTask && (
                        <div className="current-task-info">
                            <h3>Current Task</h3>
                            <div className="task-title">{currentTask.title}</div>
                            {currentTask.description && (
                                <div className="task-description">{currentTask.description}</div>
                            )}
                            {currentTask.link && (
                                <div className="task-link">
                                    <a href={currentTask.link} target="_blank" rel="noopener noreferrer">
                                        <FontAwesomeIcon icon={faLink} /> View in Jira
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <CardDeck onSelectCard={handleSelectCard} selectedCard={selectedCard} />
                    
                    <div className="votes">
                        <h3>Votes ({Object.keys(votes).length}/{users.length})</h3>
                        <div className="votes-grid">
                            {Object.entries(votes).map(([userId, vote]) => (
                                <div key={userId} className="vote">
                                    <span className="vote-user">{vote.username}</span>
                                    <span className="vote-value">{vote.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="right-sidebar">
                    <TaskList 
                        tasks={tasks}
                        currentTaskId={currentTaskId}
                        isHost={isHost}
                        onCreateTask={handleCreateTask}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        onSetCurrentTask={handleSetCurrentTask}
                    />
                </div>
            </div>
        </div>
    );
}; 
