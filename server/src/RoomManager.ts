interface Room {
    id: string;
    votes: Record<string, string>;
    users: Set<string>;
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
            users: new Set()
        });
    }

    joinRoom(roomId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) {
            return false;
        }

        return true;
    }

    addVote(roomId: string, userId: string, value: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) {
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

    getRoomVotes(roomId: string): Record<string, string> {
        const room = this.rooms.get(roomId);
        return room ? room.votes : {};
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
