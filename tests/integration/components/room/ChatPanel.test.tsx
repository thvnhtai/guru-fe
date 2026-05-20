import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPanel } from "@/components/room/ChatPanel";
import { useChatStore } from "@/stores/chatStore";
import type { ChatMessage } from "@/types/room";

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: "msg-1",
  sessionId: "alice-session",
  senderName: "Alice",
  senderColor: "#ff0000",
  content: "hello world",
  timestamp: new Date("2025-01-01T10:00:00Z").toISOString(),
  ...overrides,
});

beforeEach(() => {
  useChatStore.setState({ messages: [] });
});

describe("ChatPanel", () => {
  it("renders the chat section heading", () => {
    render(<ChatPanel />);
    expect(screen.getByText(/chat/i)).toBeInTheDocument();
  });

  it("shows empty state when there are no messages", () => {
    render(<ChatPanel />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it("renders messages with sender name and content", () => {
    useChatStore.setState({ messages: [makeMessage()] });
    render(<ChatPanel />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("renders the message timestamp", () => {
    useChatStore.setState({ messages: [makeMessage()] });
    render(<ChatPanel />);
    // Timestamp should be rendered (exact format depends on locale)
    const timestamps = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timestamps.length).toBeGreaterThan(0);
  });

  it("calls onSend with trimmed content when send button is clicked", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatPanel onSend={onSend} />);

    await user.type(screen.getByPlaceholderText(/message/i), "  hi there  ");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(onSend).toHaveBeenCalledWith("hi there");
  });

  it("calls onSend when Enter is pressed", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatPanel onSend={onSend} />);

    await user.type(screen.getByPlaceholderText(/message/i), "hello{Enter}");

    expect(onSend).toHaveBeenCalledWith("hello");
  });

  it("does not call onSend for empty input", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatPanel onSend={onSend} />);

    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not call onSend for whitespace-only input", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatPanel onSend={onSend} />);

    await user.type(screen.getByPlaceholderText(/message/i), "   ");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("clears the input after sending", async () => {
    const user = userEvent.setup();
    render(<ChatPanel />);
    const input = screen.getByPlaceholderText(/message/i);

    await user.type(input, "hello");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(input).toHaveValue("");
  });
});
