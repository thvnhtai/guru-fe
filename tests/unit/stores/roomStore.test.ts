import { describe, it, expect, beforeEach } from "vitest";
import { useRoomStore } from "@/stores/roomStore";

// Reset store state between tests
beforeEach(() => {
  useRoomStore.setState({
    roomId: "",
    language: "python",
    problemSlug: null,
    participants: [],
  });
});

describe("roomStore initial state", () => {
  it("has python as the default language", () => {
    expect(useRoomStore.getState().language).toBe("python");
  });

  it("has null problemSlug by default", () => {
    expect(useRoomStore.getState().problemSlug).toBeNull();
  });

  it("has empty participants array by default", () => {
    expect(useRoomStore.getState().participants).toHaveLength(0);
  });
});

describe("roomStore.setLanguage", () => {
  it("updates language", () => {
    useRoomStore.getState().setLanguage("javascript");
    expect(useRoomStore.getState().language).toBe("javascript");
  });

  it("does not mutate other fields", () => {
    useRoomStore.setState({ problemSlug: "two-sum" });
    useRoomStore.getState().setLanguage("java");
    expect(useRoomStore.getState().problemSlug).toBe("two-sum");
    expect(useRoomStore.getState().participants).toHaveLength(0);
  });
});

describe("roomStore.setProblemSlug", () => {
  it("updates problemSlug", () => {
    useRoomStore.getState().setProblemSlug("two-sum");
    expect(useRoomStore.getState().problemSlug).toBe("two-sum");
  });

  it("can be set back to null", () => {
    useRoomStore.setState({ problemSlug: "two-sum" });
    useRoomStore.getState().setProblemSlug(null);
    expect(useRoomStore.getState().problemSlug).toBeNull();
  });

  it("does not mutate other fields", () => {
    useRoomStore.setState({ language: "cpp" });
    useRoomStore.getState().setProblemSlug("two-sum");
    expect(useRoomStore.getState().language).toBe("cpp");
  });
});

describe("roomStore.setParticipants", () => {
  it("replaces participants array", () => {
    const participant = {
      sessionId: "abc",
      name: "Alice",
      color: "#ff0000",
      joinedAt: new Date().toISOString(),
      isOnline: true,
    };
    useRoomStore.getState().setParticipants([participant]);
    expect(useRoomStore.getState().participants).toHaveLength(1);
    expect(useRoomStore.getState().participants[0]?.name).toBe("Alice");
  });
});
