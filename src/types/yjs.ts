import type { SupportedLanguage } from "./room";

/** Shape of the Y.Map("room-meta") entries */
export interface RoomMeta {
  language: SupportedLanguage;
  problemSlug: string | null;
}

/** Shape of items in Y.Array("chat") */
export interface YjsChatMessage {
  id: string;
  sessionId: string;
  senderName: string;
  senderColor: string;
  content: string;
  timestamp: string;
}

/** Shape published to Yjs Awareness by each client */
export interface AwarenessState {
  name: string;
  color: string;
  sessionId: string;
  cursor: CursorPosition | null;
}

export interface CursorPosition {
  /** Absolute character offset in Y.Text */
  index: number;
  /** Selection length in characters (0 = cursor only) */
  length: number;
}
