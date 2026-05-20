import { useEffect, useRef } from "react";
import { useRoomStore } from "@/stores/roomStore";
import { useUserStore } from "@/stores/userStore";
import { getRoomStorage } from "@/lib/storage/roomStorage";
import type { PersistedRoom } from "@/types/persistence";

const AUTO_SAVE_INTERVAL = 30000; // Save every 30 seconds

/**
 * Hook to automatically save room state during collaboration
 * Captures current editor state and saves to persistent storage
 */
export function useRoomAutoSave() {
  const {
    roomId,
    language,
    problemSlug,
    isRoomCreator,
    roomAccessLevel,
    submissionHistory,
  } = useRoomStore();
  const { user } = useUserStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>("");

  useEffect(() => {
    if (!roomId) return;

    const saveRoom = async () => {
      try {
        // Get current code from Yjs document (if available)
        // For now, we'll use the last submission code as proxy
        const lastSubmission = submissionHistory[0];
        const currentCode = lastSubmission?.code || "";

        // Calculate stats
        const successfulSubmissions = submissionHistory.filter(
          (s) => s.status === "success"
        ).length;

        // Create persisted room snapshot
        const persistedRoom: PersistedRoom = {
          id: roomId,
          creatorId: user?.id || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          language,
          problemSlug: problemSlug || undefined,
          code: currentCode,
          title: problemSlug ? `Problem: ${problemSlug}` : "Untitled",
          isArchived: false,
          isActive: true,
          submissionIds: submissionHistory.map((s) => s.id),
          participantCount: 1, // TODO: Track from awareness
          lastActivityAt: new Date().toISOString(),
          totalSubmissions: submissionHistory.length,
          successfulSubmissions,
        };

        // Only save if content has changed
        const serialized = JSON.stringify(persistedRoom);
        if (serialized !== lastSaveRef.current) {
          const storage = getRoomStorage();
          await storage.saveRoom(persistedRoom);
          lastSaveRef.current = serialized;

          // Optional: Send to backend for cloud sync
          // await fetch("/api/rooms/persist", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   credentials: "include",
          //   body: JSON.stringify(persistedRoom),
          // });
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
        // Don't throw - auto-save failures shouldn't disrupt collaboration
      }
    };

    // Initial save
    saveRoom();

    // Set up periodic saves
    intervalRef.current = setInterval(saveRoom, AUTO_SAVE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [roomId, language, problemSlug, user?.id, submissionHistory]);
}

/**
 * Hook to archive a room when it's being closed
 */
export function useRoomArchival() {
  const { roomId, submissionHistory } = useRoomStore();
  const { user } = useUserStore();

  const archiveRoom = async () => {
    if (!roomId) return;

    try {
      const lastSubmission = submissionHistory[0];
      const finalCode = lastSubmission?.code || "";

      const archivalRequest = {
        roomId,
        finalCode,
        finalSubmissions: submissionHistory,
        closedAt: new Date().toISOString(),
        participantCount: 1,
      };

      // Save to local storage first (always works)
      const storage = getRoomStorage();
      const room = await storage.getRoomById(roomId);
      if (room) {
        await storage.archiveRoom(roomId);
      }

      // Optional: Send archival to backend
      // await fetch("/api/rooms/archive", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   credentials: "include",
      //   body: JSON.stringify(archivalRequest),
      // });
    } catch (error) {
      console.error("Room archival failed:", error);
      // Don't throw - archival failures shouldn't prevent user from leaving
    }
  };

  return { archiveRoom };
}
