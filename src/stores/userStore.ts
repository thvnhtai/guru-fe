import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { colorFromString } from "@/lib/utils/colors";
import type { User } from "@/types/auth";
import type { Bookmark } from "@/types/bookmark";
import * as authApi from "@/lib/api/auth";
import * as bookmarksApi from "@/lib/api/bookmarks";

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
  isLoadingBookmarks: boolean;
  bookmarkError: string | null;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (problemSlug: string) => void;
  addBookmarkAsync: (bookmark: Omit<Bookmark, "id">) => Promise<void>;
  removeBookmarkAsync: (problemSlug: string) => Promise<void>;
  updateBookmarkAsync: (problemSlug: string, updates: { isSolved?: boolean; notes?: string }) => Promise<void>;
  loadBookmarks: () => Promise<void>;
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
      isLoadingBookmarks: false,
      bookmarkError: null,

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

      addBookmarkAsync: async (bookmark: Omit<Bookmark, "id">) => {
        set({ isLoadingBookmarks: true, bookmarkError: null });
        try {
          const created = await bookmarksApi.createBookmark(bookmark);
          set((state) => ({
            bookmarks: [created, ...state.bookmarks],
            isLoadingBookmarks: false,
          }));
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Failed to bookmark";
          set({ bookmarkError: errorMsg, isLoadingBookmarks: false });
          // Optimistic fallback: add to local state anyway
          set((state) => ({
            bookmarks: [
              {
                ...bookmark,
                id: Math.random().toString(),
                bookmarkedAt: new Date().toISOString(),
              } as Bookmark,
              ...state.bookmarks,
            ],
          }));
        }
      },

      removeBookmarkAsync: async (problemSlug: string) => {
        set({ isLoadingBookmarks: true, bookmarkError: null });
        try {
          await bookmarksApi.deleteBookmark(problemSlug);
          set((state) => ({
            bookmarks: state.bookmarks.filter((b) => b.problemSlug !== problemSlug),
            isLoadingBookmarks: false,
          }));
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Failed to remove bookmark";
          set({ bookmarkError: errorMsg, isLoadingBookmarks: false });
          // Optimistic fallback: remove from local state anyway
          set((state) => ({
            bookmarks: state.bookmarks.filter((b) => b.problemSlug !== problemSlug),
          }));
        }
      },

      updateBookmarkAsync: async (problemSlug: string, updates: { isSolved?: boolean; notes?: string }) => {
        set({ isLoadingBookmarks: true, bookmarkError: null });
        try {
          const updated = await bookmarksApi.updateBookmark(problemSlug, updates);
          set((state) => ({
            bookmarks: state.bookmarks.map((b) =>
              b.problemSlug === problemSlug ? updated : b
            ),
            isLoadingBookmarks: false,
          }));
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Failed to update bookmark";
          set({ bookmarkError: errorMsg, isLoadingBookmarks: false });
        }
      },

      loadBookmarks: async () => {
        set({ isLoadingBookmarks: true, bookmarkError: null });
        try {
          const bookmarks = await bookmarksApi.getBookmarks();
          set({ bookmarks, isLoadingBookmarks: false });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Failed to load bookmarks";
          set({ bookmarkError: errorMsg, isLoadingBookmarks: false });
          // Keep local bookmarks as fallback
        }
      },
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
