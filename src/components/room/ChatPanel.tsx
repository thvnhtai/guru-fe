"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useUserStore } from "@/stores/userStore";
import type { ChatMessage } from "@/types/room"; // used by MessageBubbleProps

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
      <div className="flex items-baseline gap-1.5">
        {!isOwn && (
          <span
            className="text-[11px] font-semibold"
            style={{ color: message.senderColor }}
          >
            {message.senderName}
          </span>
        )}
        <span className="text-[10px] text-gray-400">{formatTime(message.timestamp)}</span>
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-xs leading-relaxed ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

interface Props {
  onSend?: (content: string) => void;
  readOnly?: boolean;
}

export function ChatPanel({ onSend, readOnly = false }: Props) {
  const { messages } = useChatStore();
  const { sessionId } = useUserStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    onSend?.(content);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-3 pb-2">
        Chat
      </p>

      <div className="flex-1 overflow-y-auto px-3 space-y-3 pb-2">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center pt-6">
            No messages yet
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sessionId === sessionId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {readOnly ? (
        <div className="px-3 py-2.5 border-t border-gray-100 text-[10px] text-gray-400 text-center">
          Observer mode — read only
        </div>
      ) : (
        <div className="flex gap-2 p-3 border-t border-gray-100">
          <input
            type="text"
            placeholder="Message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-1.5 text-xs font-medium transition-colors"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
