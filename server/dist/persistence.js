import { prisma } from './db.js';
/**
 * Save Yjs document state to database
 * Stores binary update as base64 string for persistence
 */
export async function saveDocumentState(roomId, update) {
    try {
        const updateBase64 = Buffer.from(update).toString('base64');
        await prisma.room.update({
            where: { id: roomId },
            data: {
                documentState: updateBase64,
                updatedAt: new Date(),
            },
        });
    }
    catch (error) {
        console.error(`Error saving document state for room ${roomId}:`, error);
    }
}
/**
 * Load Yjs document state from database
 * Returns binary update to apply to a fresh Y.Doc
 */
export async function loadDocumentState(roomId) {
    try {
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { documentState: true },
        });
        if (!room || !room.documentState) {
            return null;
        }
        return Buffer.from(room.documentState, 'base64');
    }
    catch (error) {
        console.error(`Error loading document state for room ${roomId}:`, error);
        return null;
    }
}
/**
 * Clear document state (for room deletion or reset)
 */
export async function clearDocumentState(roomId) {
    try {
        await prisma.room.update({
            where: { id: roomId },
            data: {
                documentState: null,
            },
        });
    }
    catch (error) {
        console.error(`Error clearing document state for room ${roomId}:`, error);
    }
}
//# sourceMappingURL=persistence.js.map