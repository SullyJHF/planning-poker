interface User {
    id: string;
    username: string;
}

interface Task {
    id: string;
    ticketId: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    finalEstimate?: string;
    createdAt: Date;
}

type SessionPhase = 'idle' | 'voting' | 'revealed';

interface EstimationResult {
    average: number;
    median: number;
    mode: string[];
    hasConsensus: boolean;
    finalEstimate?: string;
}

interface Room {
    id: string;
    votes: Record<string, string>;
    users: Map<string, User>;
    hostId: string;
    tasks: Task[];
    currentTaskId?: string;
    sessionPhase: SessionPhase;
    estimationResult?: EstimationResult;
    jiraBaseUrl: string;
    isPrivate: boolean;
    password?: string;
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

    createRoom(roomId: string, hostId: string, hostUsername: string, isPrivate: boolean = false, password?: string): void {
        if (this.rooms.has(roomId)) {
            throw new Error('Room already exists');
        }

        this.rooms.set(roomId, {
            id: roomId,
            votes: {},
            users: new Map([[hostId, { id: hostId, username: hostUsername }]]),
            hostId,
            tasks: [],
            currentTaskId: undefined,
            sessionPhase: 'idle',
            estimationResult: undefined,
            jiraBaseUrl: '',
            isPrivate,
            password: isPrivate ? password : undefined
        });
    }

    validateRoomPassword(roomId: string, password?: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) {
            return false;
        }
        
        // Public rooms don't need password validation
        if (!room.isPrivate) {
            return true;
        }
        
        // Private rooms require password
        return room.password === password;
    }

    updateRoomPassword(roomId: string, hostId: string, newPassword?: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== hostId) {
            return false;
        }
        
        room.password = room.isPrivate ? newPassword : undefined;
        return true;
    }

    joinRoom(roomId: string, userId: string, username: string, password?: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) {
            return false;
        }
        
        // Check password for private rooms, but skip for the host
        if (room.isPrivate && userId !== room.hostId && !this.validateRoomPassword(roomId, password)) {
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

    handleDisconnect(userId: string): string[] {
        const affectedRooms: string[] = [];
        
        // Remove user from all rooms and their votes
        this.rooms.forEach((room, roomId) => {
            if (room.users.has(userId)) {
                room.users.delete(userId);
                delete room.votes[userId];
                affectedRooms.push(roomId);

                // If the host disconnects, assign a new host
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
            }
        });
        
        return affectedRooms;
    }

    getRoomPrivacy(roomId: string): { isPrivate: boolean; password?: string } | null {
        const room = this.rooms.get(roomId);
        if (!room) return null;
        
        return {
            isPrivate: room.isPrivate,
            password: room.password
        };
    }

    getRoomVotes(roomId: string): Record<string, { value: string; username: string; }> {
        const room = this.rooms.get(roomId);
        if (!room) return {};

        // During voting phase, hide vote values but show who has voted
        if (room.sessionPhase === 'voting') {
            const hiddenVotes: Record<string, { value: string; username: string; }> = {};
            Object.keys(room.votes).forEach(userId => {
                const user = room.users.get(userId);
                if (user) {
                    hiddenVotes[userId] = {
                        value: '***', // Hidden vote indicator
                        username: user.username
                    };
                }
            });
            return hiddenVotes;
        }

        // During revealed phase or idle, show actual votes
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
        return Array.from(this.rooms.entries())
            .filter(([id, room]) => !room.isPrivate) // Filter out private rooms
            .map(([id, room]) => {
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

    createTask(roomId: string, userId: string, task: Omit<Task, 'id' | 'createdAt'>): Task | null {
        const room = this.rooms.get(roomId);
        if (!room || !room.users.has(userId)) {
            return null;
        }

        const newTask: Task = {
            ...task,
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date()
        };

        room.tasks.unshift(newTask);
        return newTask;
    }

    updateTask(roomId: string, userId: string, taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
        const room = this.rooms.get(roomId);
        if (!room || !room.users.has(userId)) {
            return null;
        }

        const taskIndex = room.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return null;
        }

        room.tasks[taskIndex] = { ...room.tasks[taskIndex], ...updates };
        return room.tasks[taskIndex];
    }

    deleteTask(roomId: string, userId: string, taskId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || !room.users.has(userId)) {
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
        room.sessionPhase = 'idle';
        room.estimationResult = undefined;

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

    // Session Management Methods

    startVoting(roomId: string, hostId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== hostId || !room.currentTaskId) {
            return false;
        }

        room.sessionPhase = 'voting';
        room.votes = {}; // Clear previous votes
        room.estimationResult = undefined;
        return true;
    }

    revealVotes(roomId: string, hostId: string): EstimationResult | null {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== hostId || room.sessionPhase !== 'voting') {
            return null;
        }

        room.sessionPhase = 'revealed';
        const result = this.calculateEstimationResult(room.votes);
        room.estimationResult = result;
        return result;
    }

    resetVoting(roomId: string, hostId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== hostId) {
            return false;
        }

        room.sessionPhase = 'idle';
        room.votes = {};
        room.estimationResult = undefined;
        return true;
    }

    finalizeEstimate(roomId: string, hostId: string, estimate: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== hostId || !room.currentTaskId) {
            return false;
        }

        const currentTask = room.tasks.find(task => task.id === room.currentTaskId);
        if (!currentTask) {
            return false;
        }

        currentTask.finalEstimate = estimate;
        currentTask.status = 'completed';
        room.sessionPhase = 'idle';
        room.currentTaskId = undefined;
        room.votes = {};
        room.estimationResult = undefined;

        return true;
    }

    getSessionState(roomId: string): { phase: SessionPhase; estimationResult?: EstimationResult } | null {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        return {
            phase: room.sessionPhase,
            estimationResult: room.estimationResult
        };
    }

    updateJiraBaseUrl(roomId: string, hostId: string, jiraBaseUrl: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room || room.hostId !== hostId) {
            return false;
        }

        room.jiraBaseUrl = jiraBaseUrl;
        return true;
    }

    getJiraBaseUrl(roomId: string): string | null {
        const room = this.rooms.get(roomId);
        return room ? room.jiraBaseUrl : null;
    }

    roomExists(roomId: string): boolean {
        return this.rooms.has(roomId);
    }

    private calculateEstimationResult(votes: Record<string, string>): EstimationResult {
        const voteValues = Object.values(votes);
        
        // Filter out non-numeric votes (like ?, ∞)
        const numericVotes = voteValues
            .filter(vote => !isNaN(Number(vote)) && vote !== '?' && vote !== '∞')
            .map(vote => Number(vote));

        // Calculate average
        const average = numericVotes.length > 0 
            ? numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length 
            : 0;

        // Calculate median
        const sortedVotes = [...numericVotes].sort((a, b) => a - b);
        const median = sortedVotes.length > 0
            ? sortedVotes.length % 2 === 0
                ? (sortedVotes[sortedVotes.length / 2 - 1] + sortedVotes[sortedVotes.length / 2]) / 2
                : sortedVotes[Math.floor(sortedVotes.length / 2)]
            : 0;

        // Calculate mode (most frequent values)
        const voteFrequency: Record<string, number> = {};
        voteValues.forEach(vote => {
            voteFrequency[vote] = (voteFrequency[vote] || 0) + 1;
        });

        const maxFrequency = Math.max(...Object.values(voteFrequency));
        const mode = Object.keys(voteFrequency).filter(vote => voteFrequency[vote] === maxFrequency);

        // Check for consensus (all votes are the same or within 1 point for Fibonacci)
        const hasConsensus = voteValues.length > 1 && (
            new Set(voteValues).size === 1 || // All votes identical
            (numericVotes.length === voteValues.length && Math.max(...numericVotes) - Math.min(...numericVotes) <= 1)
        );

        return {
            average: Math.round(average * 100) / 100, // Round to 2 decimal places
            median,
            mode,
            hasConsensus
        };
    }
} 
