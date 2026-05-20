import { create } from "zustand";
import type { ChatMessage } from "@/types/room";

interface ChatState {
  messages: ChatMessage[];
  appendMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  appendMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
}));
