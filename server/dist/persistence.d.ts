/**
 * Save Yjs document state to database
 * Stores binary update as base64 string for persistence
 */
export declare function saveDocumentState(roomId: string, update: Uint8Array): Promise<void>;
/**
 * Load Yjs document state from database
 * Returns binary update to apply to a fresh Y.Doc
 */
export declare function loadDocumentState(roomId: string): Promise<Uint8Array | null>;
/**
 * Clear document state (for room deletion or reset)
 */
export declare function clearDocumentState(roomId: string): Promise<void>;
//# sourceMappingURL=persistence.d.ts.map