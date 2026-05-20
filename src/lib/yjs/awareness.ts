import { colorFromString } from "@/lib/utils/colors";
import type { AwarenessState, CursorPosition } from "@/types/yjs";
import type { Participant } from "@/types/room";

interface BuildAwarenessParams {
  name: string;
  sessionId: string;
  cursor?: CursorPosition | null;
}

export function buildAwarenessState({
  name,
  sessionId,
  cursor = null,
}: BuildAwarenessParams): AwarenessState {
  return {
    name,
    sessionId,
    color: colorFromString(sessionId),
    cursor: cursor ?? null,
  };
}

/**
 * Converts the raw Yjs awareness Map to a Participant array,
 * excluding the local client.
 */
export function parseAwarenessStates(
  rawMap: Map<number, { user: AwarenessState }>,
  localClientId: number
): Participant[] {
  const participants: Participant[] = [];

  rawMap.forEach((value, clientId) => {
    if (clientId === localClientId) return;
    if (!value.user) return;

    participants.push({
      sessionId: value.user.sessionId,
      name: value.user.name,
      color: value.user.color,
      joinedAt: new Date().toISOString(),
      isOnline: true,
    });
  });

  return participants;
}
