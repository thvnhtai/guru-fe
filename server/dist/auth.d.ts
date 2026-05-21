export interface ConnectionContext {
    roomId: string;
    userId: string;
    sessionId: string;
    isObserver: boolean;
}
/**
 * Extract authentication info from WebSocket connection message
 * Format: { roomId, userId, sessionId, token?, isObserver? }
 */
export declare function parseAuthMessage(data: string): Partial<ConnectionContext> | null;
/**
 * Validate room access based on access level and user role
 */
export declare function validateRoomAccess(roomId: string, userId: string, _isObserver: boolean): Promise<boolean>;
/**
 * Get room from database
 */
export declare function getRoom(roomId: string): Promise<({
    participants: {
        id: string;
        userId: string;
        roomId: string;
        role: string;
        joinedAt: Date;
        lastSeenAt: Date;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    problemSlug: string | null;
    title: string | null;
    creatorId: string;
    language: string;
    accessLevel: string;
    isActive: boolean;
    isArchived: boolean;
    documentState: string | null;
    closedAt: Date | null;
}) | null>;
/**
 * Track participant in database
 */
export declare function addParticipant(roomId: string, userId: string, _sessionId: string): Promise<void>;
/**
 * Remove participant from room
 */
export declare function removeParticipant(roomId: string, userId: string): Promise<void>;
/**
 * Get all active participants in a room
 */
export declare function getRoomParticipants(roomId: string): Promise<{
    id: string;
    userId: string;
    roomId: string;
    role: string;
    joinedAt: Date;
    lastSeenAt: Date;
}[]>;
//# sourceMappingURL=auth.d.ts.map