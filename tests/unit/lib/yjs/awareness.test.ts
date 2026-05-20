import { describe, it, expect } from "vitest";
import { buildAwarenessState, parseAwarenessStates } from "@/lib/yjs/awareness";
import type { AwarenessState } from "@/types/yjs";

describe("buildAwarenessState", () => {
  it("returns an AwarenessState with the provided name and sessionId", () => {
    const state = buildAwarenessState({ name: "Alice", sessionId: "abc123" });
    expect(state.name).toBe("Alice");
    expect(state.sessionId).toBe("abc123");
  });

  it("assigns a deterministic hex color from sessionId", () => {
    const state1 = buildAwarenessState({ name: "Alice", sessionId: "abc123" });
    const state2 = buildAwarenessState({ name: "Bob", sessionId: "abc123" });
    // Same sessionId → same color regardless of name
    expect(state1.color).toBe(state2.color);
    expect(state1.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("assigns different colors for different sessionIds", () => {
    const state1 = buildAwarenessState({ name: "Alice", sessionId: "aaa" });
    const state2 = buildAwarenessState({ name: "Alice", sessionId: "zzz" });
    expect(state1.color).not.toBe(state2.color);
  });

  it("sets cursor to null by default", () => {
    const state = buildAwarenessState({ name: "Alice", sessionId: "abc" });
    expect(state.cursor).toBeNull();
  });

  it("sets cursor when provided", () => {
    const state = buildAwarenessState({
      name: "Alice",
      sessionId: "abc",
      cursor: { index: 42, length: 5 },
    });
    expect(state.cursor).toEqual({ index: 42, length: 5 });
  });
});

describe("parseAwarenessStates", () => {
  it("converts a Map of awareness states to Participant array", () => {
    const LOCAL_CLIENT_ID = 1;
    const rawMap = new Map<number, { user: AwarenessState }>([
      [
        1,
        {
          user: {
            name: "Alice",
            color: "#ff0000",
            sessionId: "alice-id",
            cursor: null,
          },
        },
      ],
      [
        2,
        {
          user: {
            name: "Bob",
            color: "#00ff00",
            sessionId: "bob-id",
            cursor: null,
          },
        },
      ],
    ]);

    const participants = parseAwarenessStates(rawMap, LOCAL_CLIENT_ID);
    // Excludes local client (clientId === LOCAL_CLIENT_ID)
    expect(participants).toHaveLength(1);
    expect(participants[0]?.name).toBe("Bob");
    expect(participants[0]?.sessionId).toBe("bob-id");
  });

  it("returns empty array when only local client is present", () => {
    const LOCAL_CLIENT_ID = 1;
    const rawMap = new Map<number, { user: AwarenessState }>([
      [
        1,
        {
          user: {
            name: "Alice",
            color: "#ff0000",
            sessionId: "alice-id",
            cursor: null,
          },
        },
      ],
    ]);
    expect(parseAwarenessStates(rawMap, LOCAL_CLIENT_ID)).toHaveLength(0);
  });

  it("marks all parsed participants as isOnline: true", () => {
    const rawMap = new Map<number, { user: AwarenessState }>([
      [
        2,
        {
          user: {
            name: "Bob",
            color: "#00ff00",
            sessionId: "bob-id",
            cursor: null,
          },
        },
      ],
    ]);
    const participants = parseAwarenessStates(rawMap, 1);
    expect(participants[0]?.isOnline).toBe(true);
  });
});
