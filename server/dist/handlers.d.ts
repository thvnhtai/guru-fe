import * as Y from 'yjs';
import * as WebSocket from 'ws';
/**
 * Handle incoming sync message from client
 */
export declare function handleSync(ws: WebSocket, message: Buffer, roomId: string, doc: Y.Doc): void;
/**
 * Send initial sync state to new client
 */
export declare function sendInitialSync(ws: WebSocket, doc: Y.Doc): void;
/**
 * Broadcast document update to all clients except sender
 */
export declare function broadcastUpdate(roomId: string, update: Uint8Array, exclude?: WebSocket): void;
//# sourceMappingURL=handlers.d.ts.map