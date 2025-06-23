interface User {
    id: string;
    username: string;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    link?: string;
    status: 'pending' | 'in_progress' | 'completed';
    finalEstimate?: string;
    createdAt: Date;
}

interface Room {
    id: string;
    votes: Record<string, string>;
    users: Map<string, User>;
    hostId: string;
    tasks: Task[];
    currentTaskId?: string;
}

interface RoomInfo {
    id: string;
    userCount: number;
    hostUsername: string;
}

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map();
    }

    createRoom(roomId: string, hostId: string, hostUsername: string): void {
        if (this.rooms.has(roomId)) {
            throw new Error('Room already exists');
        }

        this.rooms.set(roomId, {
            id: roomId,
            votes: {},
            users: new Map([[hostId, { id: hostId, username: hostUsername }]]),
            hostId,
            tasks: [],
            currentTaskId: undefined
        });
    }

    joinRoom(roomId: string, userId: string, username: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) {
            return false;
        }

        room.users.set(userId, { id: userId, username });
        return true;
    }

    updateUsername(roomId: string, userId: string, username: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || !room.users.has(userId)) {
            return false;
        }

        const user = room.users.get(userId);
        if (user) {
            user.username = username;
            room.users.set(userId, user);
            return true;
        }
        return false;
    }

    addVote(roomId: string, userId: string, value: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || !room.users.has(userId)) {
            return false;
        }

        room.votes[userId] = value;
        return true;
    }

    handleDisconnect(userId: string): void {
        // Remove user from all rooms and their votes
        this.rooms.forEach((room) => {
            if (room.users.has(userId)) {
                room.users.delete(userId);
                delete room.votes[userId];

                // If the host disconnects, assign a new host
                if (room.hostId === userId && room.users.size > 0) {
                    const newHost = room.users.keys().next().value;
                    if (newHost) {
                        room.hostId = newHost;
                    }
                }
            }
        });
    }

    getRoomVotes(roomId: string): Record<string, { value: string; username: string; }> {
        const room = this.rooms.get(roomId);
        if (!room) return {};

        const votesWithUsernames: Record<string, { value: string; username: string; }> = {};
        Object.entries(room.votes).forEach(([userId, value]) => {
            const user = room.users.get(userId);
            if (user) {
                votesWithUsernames[userId] = {
                    value,
                    username: user.username
                };
            }
        });
        return votesWithUsernames;
    }

    getRoomUsers(roomId: string): User[] {
        const room = this.rooms.get(roomId);
        if (!room) return [];
        return Array.from(room.users.values());
    }

    getActiveRooms(): RoomInfo[] {
        return Array.from(this.rooms.entries()).map(([id, room]) => {
            const host = room.users.get(room.hostId);
            return {
                id,
                userCount: room.users.size,
                hostUsername: host?.username || 'Unknown'
            };
        });
    }

    clearVotes(roomId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) {
            return false;
        }

        room.votes = {};
        return true;
    }

    leaveRoom(roomId: string, userId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || !room.users.has(userId)) {
            return false;
        }

        room.users.delete(userId);
        delete room.votes[userId];

        // If the host leaves, assign a new host
        if (room.hostId === userId && room.users.size > 0) {
            const newHost = room.users.keys().next().value;
            if (newHost) {
                room.hostId = newHost;
            }
        }

        // If no users left, delete the room
        if (room.users.size === 0) {
            this.rooms.delete(roomId);
        }

        return true;
    }

    transferHost(roomId: string, currentHostId: string, newHostId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== currentHostId || !room.users.has(newHostId)) {
            return false;
        }

        room.hostId = newHostId;
        return true;
    }

    getHostId(roomId: string): string | null {
        const room = this.rooms.get(roomId);
        return room ? room.hostId : null;
    }

    createTask(roomId: string, hostId: string, task: Omit<Task, 'id' | 'createdAt'>): Task | null {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== hostId) {
            return null;
        }

        const newTask: Task = {
            ...task,
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date()
        };

        room.tasks.push(newTask);
        return newTask;
    }

    updateTask(roomId: string, hostId: string, taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== hostId) {
            return null;
        }

        const taskIndex = room.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return null;
        }

        room.tasks[taskIndex] = { ...room.tasks[taskIndex], ...updates };
        return room.tasks[taskIndex];
    }

    deleteTask(roomId: string, hostId: string, taskId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== hostId) {
            return false;
        }

        const taskIndex = room.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return false;
        }

        room.tasks.splice(taskIndex, 1);
        
        if (room.currentTaskId === taskId) {
            room.currentTaskId = undefined;
        }

        return true;
    }

    setCurrentTask(roomId: string, hostId: string, taskId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== hostId) {
            return false;
        }

        const task = room.tasks.find(task => task.id === taskId);
        if (!task) {
            return false;
        }

        if (room.currentTaskId) {
            const currentTask = room.tasks.find(t => t.id === room.currentTaskId);
            if (currentTask && currentTask.status === 'in_progress') {
                currentTask.status = 'pending';
            }
        }

        room.currentTaskId = taskId;
        task.status = 'in_progress';
        room.votes = {};

        return true;
    }

    getTasks(roomId: string): Task[] {
        const room = this.rooms.get(roomId);
        return room ? room.tasks : [];
    }

    getCurrentTask(roomId: string): Task | null {
        const room = this.rooms.get(roomId);
        if (!room || !room.currentTaskId) {
            return null;
        }

        return room.tasks.find(task => task.id === room.currentTaskId) || null;
    }
} 
