import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { RoomMeta } from "@/types/yjs";
import type { SupportedLanguage } from "@/types/room";

export interface YjsContext {
  doc: Y.Doc;
  provider: WebsocketProvider;
}

/**
 * Creates a Y.Doc and connects it to the backend via WebSocket.
 * The roomId is used as the document name so all clients in the room share the same doc.
 */
export function initYjsProvider(roomId: string, wsUrl: string): YjsContext {
  const doc = new Y.Doc();
  const provider = new WebsocketProvider(wsUrl, roomId, doc);
  return { doc, provider };
}

export function getSharedCode(doc: Y.Doc): Y.Text {
  return doc.getText("code");
}

export function getSharedNotes(doc: Y.Doc): Y.Text {
  return doc.getText("notes");
}

export function getSharedChat(doc: Y.Doc): Y.Array<unknown> {
  return doc.getArray("chat");
}

export function getRoomMeta(doc: Y.Doc): Y.Map<RoomMeta[keyof RoomMeta]> {
  return doc.getMap<RoomMeta[keyof RoomMeta]>("room-meta");
}

export function setRoomMetaLanguage(
  doc: Y.Doc,
  language: SupportedLanguage
): void {
  getRoomMeta(doc).set("language", language);
}

export function setRoomMetaProblemSlug(
  doc: Y.Doc,
  slug: string | null
): void {
  getRoomMeta(doc).set("problemSlug", slug as RoomMeta[keyof RoomMeta]);
}
