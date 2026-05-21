import * as Y from 'yjs';
import * as WebSocket from 'ws';
export interface RoomState {
    roomId: string;
    document: Y.Doc;
    connections: Map<string, WebSocket>;
    userIds: Map<WebSocket, string>;
    awareness: Map<string, any>;
}
/**
 * Manage room documents and connections
 */
export declare class RoomManager {
    private rooms;
    /**
     * Get or create room
     */
    getRoom(roomId: string): RoomState;
    /**
     * Add connection to room
     */
    addConnection(roomId: string, ws: WebSocket, userId: string, sessionId: string): string;
    /**
     * Remove connection from room
     */
    removeConnection(roomId: string, ws: WebSocket, userId: string): void;
    /**
     * Broadcast message to all clients in room except sender
     */
    broadcast(roomId: string, message: any, exclude?: WebSocket): void;
    /**
     * Get room document
     */
    getDocument(roomId: string): Y.Doc;
    /**
     * Get room connections count
     */
    getConnectionCount(roomId: string): number;
    /**
     * Get room participants
     */
    getParticipants(roomId: string): any[];
    /**
     * Generate color from string hash
     */
    private hashToColor;
}
export declare const roomManager: RoomManager;
//# sourceMappingURL=rooms.d.ts.map