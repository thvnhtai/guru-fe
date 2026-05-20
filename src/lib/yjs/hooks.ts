"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { initYjsProvider, getSharedCode, getRoomMeta, getSharedChat } from "./provider";
import { buildAwarenessState, parseAwarenessStates } from "./awareness";
import { useRoomStore } from "@/stores/roomStore";
import { useUserStore } from "@/stores/userStore";
import { useChatStore } from "@/stores/chatStore";
import type { YjsChatMessage } from "@/types/yjs";
import type { SupportedLanguage } from "@/types/room";

const WS_URL =
  process.env["NEXT_PUBLIC_WS_URL"] ?? "ws://localhost:4000";

// Derive Awareness type from WebsocketProvider to avoid a direct
// dependency on y-protocols (which is a transitive dep of y-websocket).
type Awareness = WebsocketProvider["awareness"];

export interface YjsContext {
  doc: Y.Doc;
  provider: WebsocketProvider;
  yText: Y.Text;
  yChat: Y.Array<YjsChatMessage>;
  awareness: Awareness;
}

export type WsStatus = "connecting" | "connected" | "reconnecting";

export function useYjsRoom(roomId: string) {
  const contextRef = useRef<YjsContext | null>(null);
  const hasConnected = useRef(false);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");
  const [yText, setYText] = useState<Y.Text | null>(null);
  const [awareness, setAwareness] = useState<Awareness | null>(null);

  const { name, sessionId } = useUserStore();
  const { setLanguage, setProblemSlug, setParticipants } = useRoomStore();
  const { appendMessage } = useChatStore();

  useEffect(() => {
    if (!roomId) return;

    const { doc, provider } = initYjsProvider(roomId, WS_URL);
    const yText = getSharedCode(doc);
    const yChat = getSharedChat(doc) as Y.Array<YjsChatMessage>;
    const awareness = provider.awareness as unknown as Awareness;

    contextRef.current = { doc, provider, yText, yChat, awareness };
    setYText(yText);
    setAwareness(awareness);

    // Publish local identity to awareness
    provider.awareness.setLocalStateField(
      "user",
      buildAwarenessState({ name, sessionId })
    );

    // Watch connection status — distinguish first connect from reconnect
    const onStatus = ({ status }: { status: string }) => {
      if (status === "connected") {
        hasConnected.current = true;
        setWsStatus("connected");
      } else {
        // "connecting" or "disconnected" — if we were ever connected it's a reconnect
        setWsStatus(hasConnected.current ? "reconnecting" : "connecting");
      }
    };
    provider.on("status", onStatus);

    // Sync room-meta Y.Map → roomStore
    const metaMap = getRoomMeta(doc);
    const onMetaChange = () => {
      const lang = metaMap.get("language") as SupportedLanguage | undefined;
      const slug = metaMap.get("problemSlug") as string | null | undefined;
      if (lang) setLanguage(lang);
      if (slug !== undefined) setProblemSlug(slug ?? null);
    };
    metaMap.observe(onMetaChange);

    // Sync chat Y.Array → chatStore
    // Track the last synced length so we only append NEW messages
    let syncedCount = 0;
    const onChatChange = () => {
      const all = yChat.toArray();
      const newMsgs = all.slice(syncedCount);
      newMsgs.forEach((msg) => appendMessage(msg));
      syncedCount = all.length;
    };
    yChat.observe(onChatChange);

    // Sync awareness → participants
    const onAwarenessChange = () => {
      const states = provider.awareness.getStates() as Map<
        number,
        { user: Parameters<typeof parseAwarenessStates>[0] extends Map<number, infer V> ? V : never }
      >;
      const participants = parseAwarenessStates(
        states as unknown as Parameters<typeof parseAwarenessStates>[0],
        provider.awareness.clientID
      );
      setParticipants(participants);
    };
    provider.awareness.on("change", onAwarenessChange);

    return () => {
      metaMap.unobserve(onMetaChange);
      yChat.unobserve(onChatChange);
      provider.awareness.off("change", onAwarenessChange);
      provider.off("status", onStatus);
      provider.destroy();
      doc.destroy();
      contextRef.current = null;
      hasConnected.current = false;
      setWsStatus("connecting");
      setYText(null);
      setAwareness(null);
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // contextRef is useful for event handlers (e.g. chat send, language change)
  // that run at user-interaction time — they always see the latest ref value.
  return { contextRef, wsStatus, yText, awareness };
}
