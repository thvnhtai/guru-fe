import * as Y from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync.js';
import { roomManager } from './rooms.js';
/**
 * Handle incoming sync message from client
 */
export function handleSync(ws, message, roomId, doc) {
    const decoder = decoding.createDecoder(message);
    const encoder = encoding.createEncoder();
    // Decode message type
    const messageType = decoding.readVarUint(decoder);
    switch (messageType) {
        case 0: // Sync step 1: client sends state vector
            handleSyncStep1(decoder, encoder, doc);
            break;
        case 1: // Sync step 2: server sends update
            handleSyncStep2(encoder, doc);
            break;
        case 2: // Update: client sends document update
            handleUpdate(decoder, doc);
            break;
        case 3: // Awareness: presence state
            handleAwareness(message, roomId);
            break;
        default:
            console.warn(`Unknown message type: ${messageType}`);
    }
    // Send response if encoder has content
    if (encoding.length(encoder) > 1) {
        ws.send(encoding.toUint8Array(encoder));
    }
}
/**
 * Step 1: Client sends state vector, server responds with updates needed
 */
function handleSyncStep1(decoder, encoder, doc) {
    encoding.writeVarUint(encoder, 0); // Message type: sync step 1
    const state = syncProtocol.readSyncStep1(decoder, encoder, doc);
    return state;
}
/**
 * Step 2: Server sends document update to client
 */
function handleSyncStep2(encoder, doc) {
    encoding.writeVarUint(encoder, 1); // Message type: sync step 2
    const state = Y.encodeStateAsUpdate(doc);
    encoding.writeVarUint8Array(encoder, state);
}
/**
 * Handle document update from client
 */
function handleUpdate(decoder, doc) {
    // Apply update to document
    const update = decoding.readVarUint8Array(decoder);
    Y.applyUpdate(doc, update);
}
/**
 * Handle awareness (presence) updates
 */
function handleAwareness(message, roomId) {
    // Parse awareness message
    try {
        const data = JSON.parse(message.toString());
        if (data.type === 'awareness-update') {
            // Broadcast awareness to other clients
            roomManager.broadcast(roomId, data);
        }
    }
    catch {
        // Not an awareness message, ignore
    }
}
/**
 * Send initial sync state to new client
 */
export function sendInitialSync(ws, doc) {
    const encoder = encoding.createEncoder();
    // Send sync step 1
    encoding.writeVarUint(encoder, 0); // Message type
    syncProtocol.writeSyncStep1(encoder, doc);
    // Send current state
    encoding.writeVarUint(encoder, 1); // Message type
    encoding.writeVarUint8Array(encoder, Y.encodeStateAsUpdate(doc));
    ws.send(encoding.toUint8Array(encoder));
}
/**
 * Broadcast document update to all clients except sender
 */
export function broadcastUpdate(roomId, update, exclude) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 2); // Message type: update
    encoding.writeVarUint8Array(encoder, update);
    const payload = encoding.toUint8Array(encoder);
    const message = Buffer.from(payload);
    roomManager.broadcast(roomId, message, exclude);
}
//# sourceMappingURL=handlers.js.map