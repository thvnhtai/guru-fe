import { prisma } from './db.js';
/**
 * Extract authentication info from WebSocket connection message
 * Format: { roomId, userId, sessionId, token?, isObserver? }
 */
export function parseAuthMessage(data) {
    try {
        const parsed = JSON.parse(data);
        return {
            roomId: parsed.roomId,
            userId: parsed.userId,
            sessionId: parsed.sessionId,
            isObserver: parsed.isObserver || false,
        };
    }
    catch {
        return null;
    }
}
/**
 * Validate room access based on access level and user role
 */
export async function validateRoomAccess(roomId, userId, _isObserver) {
    try {
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { participants: true },
        });
        if (!room) {
            console.log(`Room not found: ${roomId}`);
            return false;
        }
        const isCreator = room.creatorId === userId;
        const isParticipant = room.participants.some((p) => p.userId === userId);
        // Access levels: PUBLIC, INVITE, PRIVATE
        switch (room.accessLevel) {
            case 'PUBLIC':
                // Anyone can access public rooms
                return true;
            case 'INVITE':
                // Creator or invited participants only
                return isCreator || isParticipant;
            case 'PRIVATE':
                // Creator and participants only
                return isCreator || isParticipant;
            default:
                return false;
        }
    }
    catch (error) {
        console.error('Error validating room access:', error);
        return false;
    }
}
/**
 * Get room from database
 */
export async function getRoom(roomId) {
    try {
        return await prisma.room.findUnique({
            where: { id: roomId },
            include: { participants: true },
        });
    }
    catch (error) {
        console.error('Error fetching room:', error);
        return null;
    }
}
/**
 * Track participant in database
 */
export async function addParticipant(roomId, userId, _sessionId) {
    try {
        // Check if participant already exists
        const existing = await prisma.roomParticipant.findFirst({
            where: { roomId, userId },
        });
        if (existing) {
            // Update last seen
            await prisma.roomParticipant.update({
                where: { id: existing.id },
                data: { joinedAt: new Date() },
            });
        }
        else {
            // Create new participant
            await prisma.roomParticipant.create({
                data: {
                    roomId,
                    userId,
                    role: 'participant',
                    joinedAt: new Date(),
                },
            });
        }
    }
    catch (error) {
        console.error('Error adding participant:', error);
    }
}
/**
 * Remove participant from room
 */
export async function removeParticipant(roomId, userId) {
    try {
        await prisma.roomParticipant.deleteMany({
            where: { roomId, userId },
        });
    }
    catch (error) {
        console.error('Error removing participant:', error);
    }
}
/**
 * Get all active participants in a room
 */
export async function getRoomParticipants(roomId) {
    try {
        return await prisma.roomParticipant.findMany({
            where: { roomId },
        });
    }
    catch (error) {
        console.error('Error fetching participants:', error);
        return [];
    }
}
//# sourceMappingURL=auth.js.map