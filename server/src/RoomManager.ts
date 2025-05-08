interface User {
    id: string;
    username: string;
}

interface Room {
    id: string;
    votes: Record<string, string>;
    users: Map<string, User>;
}

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map();
    }

    createRoom(roomId: string): void {
        if (this.rooms.has(roomId)) {
            throw new Error('Room already exists');
        }

        this.rooms.set(roomId, {
            id: roomId,
            votes: {},
            users: new Map()
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

    clearVotes(roomId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) {
            return false;
        }

        room.votes = {};
        return true;
    }
} 
