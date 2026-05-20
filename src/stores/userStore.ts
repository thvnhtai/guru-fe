import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { colorFromString } from "@/lib/utils/colors";
import type { User } from "@/types/auth";
import type { Bookmark } from "@/types/bookmark";
import * as authApi from "@/lib/api/auth";

function generateSessionId(): string {
  return crypto.randomUUID();
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return generateSessionId();
  const stored = sessionStorage.getItem("guru:sessionId");
  if (stored) return stored;
  const id = generateSessionId();
  sessionStorage.setItem("guru:sessionId", id);
  return id;
}

interface UserState {
  // Session/Presence
  sessionId: string;
  name: string;
  color: string;
  setName: (name: string) => void;

  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;

  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (problemSlug: string) => void;
}

export const useUserStore = create<UserState, [["zustand/persist", unknown]]>(
  persist(
    (set) => ({
      // Session/Presence
      sessionId: getOrCreateSessionId(),
      name: "",
      color: colorFromString(getOrCreateSessionId()),
      setName: (name: string) => set({ name }),

      // Authentication
      user: null,
      isAuthenticated: false,
      isLoadingAuth: false,

      // Auth actions
      login: async (email: string, password: string) => {
        set({ isLoadingAuth: true });
        try {
          const response = await authApi.login({ email, password });
          set({
            user: response.user,
            isAuthenticated: true,
            name: response.user.displayName,
          });
        } finally {
          set({ isLoadingAuth: false });
        }
      },

      signup: async (email: string, password: string, displayName: string) => {
        set({ isLoadingAuth: true });
        try {
          const response = await authApi.signup({
            email,
            password,
            displayName,
          });
          set({
            user: response.user,
            isAuthenticated: true,
            name: response.user.displayName,
          });
        } finally {
          set({ isLoadingAuth: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            name: "",
          });
        }
      },

      checkAuth: async () => {
        set({ isLoadingAuth: true });
        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            name: user.displayName,
          });
        } catch {
          // Not authenticated or token expired
          set({
            user: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoadingAuth: false });
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: user !== null,
          name: user?.displayName || "",
        });
      },

      // Bookmarks
      bookmarks: [],
      addBookmark: (bookmark: Bookmark) =>
        set((state) => {
          const exists = state.bookmarks.some(
            (b) => b.problemSlug === bookmark.problemSlug
          );
          if (exists) return state; // Already bookmarked
          return { bookmarks: [bookmark, ...state.bookmarks] };
        }),

      removeBookmark: (problemSlug: string) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.problemSlug !== problemSlug),
        })),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        bookmarks: state.bookmarks,
      }),
    }
  )
);
