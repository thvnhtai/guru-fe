import { useEffect, useState, useCallback } from "react";
import { useUserStore } from "@/stores/userStore";
import { getRoomStorage } from "@/lib/storage/roomStorage";
import type { PersistedRoom } from "@/types/persistence";
import type { DashboardRoom } from "@/types/dashboard";

/**
 * Hook to load persisted rooms for the dashboard
 * Prioritizes localStorage, falls back to backend API
 */
export function usePersistedRooms(): {
  rooms: DashboardRoom[];
  loading: boolean;
  error: string | null;
} {
  const { user, isAuthenticated } = useUserStore();
  const [rooms, setRooms] = useState<DashboardRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      if (!isAuthenticated || !user?.id) {
        setRooms([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const storage = getRoomStorage();
        const persistedRooms = await storage.getUserRooms(user.id);

        // Convert PersistedRoom to DashboardRoom
        const dashboardRooms: DashboardRoom[] = persistedRooms
          .filter((room) => !room.isArchived) // Show only active rooms
          .map((room) => ({
            id: room.id,
            problemSlug: room.problemSlug || undefined,
            problemTitle: room.title,
            language: room.language,
            lastEdited: room.lastActivityAt,
            participantsCount: room.participantCount,
            submissionsCount: room.totalSubmissions,
            status:
              room.successfulSubmissions > 0
                ? ("success" as const)
                : room.totalSubmissions > 0
                ? ("error" as const)
                : ("pending" as const),
          }))
          .slice(0, 20); // Limit to 20 most recent

        setRooms(dashboardRooms);
      } catch (err) {
        console.error("Failed to load persisted rooms:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load rooms"
        );
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [user?.id, isAuthenticated]);

  return { rooms, loading, error };
}

/**
 * Hook to load archived rooms (for recovery/history)
 */
export function useArchivedRooms(): {
  rooms: DashboardRoom[];
  loading: boolean;
} {
  const { user, isAuthenticated } = useUserStore();
  const [rooms, setRooms] = useState<DashboardRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArchived = async () => {
      if (!isAuthenticated || !user?.id) {
        setRooms([]);
        setLoading(false);
        return;
      }

      try {
        const storage = getRoomStorage();
        const allRooms = await storage.getUserRooms(user.id);
        const archivedRooms = allRooms.filter((room) => room.isArchived);

        const dashboardRooms: DashboardRoom[] = archivedRooms.map((room) => ({
          id: room.id,
          problemSlug: room.problemSlug || undefined,
          problemTitle: room.title,
          language: room.language,
          lastEdited: room.closedAt || room.lastActivityAt,
          participantsCount: room.participantCount,
          submissionsCount: room.totalSubmissions,
          status: "success" as const,
        }));

        setRooms(dashboardRooms);
      } catch (err) {
        console.error("Failed to load archived rooms:", err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadArchived();
  }, [user?.id, isAuthenticated]);

  return { rooms, loading };
}

/**
 * Hook to recover (restart) an archived room
 */
export function useRecoverRoom() {
  const recoverRoom = useCallback(async (archivedRoomId: string, newRoomId: string) => {
    try {
      const storage = getRoomStorage();
      const archivedRoom = await storage.getRoomById(archivedRoomId);

      if (!archivedRoom) {
        throw new Error("Archived room not found");
      }

      // Create new room with archived data
      const recoveredRoom: PersistedRoom = {
        ...archivedRoom,
        id: newRoomId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
        isActive: true,
        closedAt: undefined,
        lastActivityAt: new Date().toISOString(),
        totalSubmissions: 0,
        successfulSubmissions: 0,
        submissionIds: [],
      };

      await storage.saveRoom(recoveredRoom);
      return recoveredRoom;
    } catch (error) {
      console.error("Failed to recover room:", error);
      throw error;
    }
  }, []);

  return { recoverRoom };
}
