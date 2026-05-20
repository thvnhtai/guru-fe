import type { RoomStorage, PersistedRoom, PersistedRoomWithHistory } from "@/types/persistence";
import type { SubmissionResult } from "@/types/room";

const STORAGE_KEY_PREFIX = "guru:room:";
const ROOMS_INDEX_KEY = "guru:rooms:index";

/**
 * LocalStorage-based room storage implementation
 * In production, this would be replaced with backend API calls
 * The interface remains the same, so frontend code doesn't change
 */
export class LocalRoomStorage implements RoomStorage {
  async saveRoom(room: PersistedRoom): Promise<void> {
    if (typeof window === "undefined") return; // SSR safety

    try {
      const key = `${STORAGE_KEY_PREFIX}${room.id}`;
      localStorage.setItem(key, JSON.stringify(room));
      this.updateRoomsIndex(room.id);
    } catch (error) {
      console.error("Failed to save room:", error);
      throw error;
    }
  }

  async getRoomById(roomId: string): Promise<PersistedRoom | null> {
    if (typeof window === "undefined") return null;

    try {
      const key = `${STORAGE_KEY_PREFIX}${roomId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get room:", error);
      return null;
    }
  }

  async getRoomWithHistory(roomId: string): Promise<PersistedRoomWithHistory | null> {
    if (typeof window === "undefined") return null;

    try {
      const room = await this.getRoomById(roomId);
      if (!room) return null;

      // For localStorage, we reconstruct submissions from room data
      // In production backend, this would be a single query
      return {
        ...room,
        submissions: [], // TODO: Reconstruct from submission storage if needed
      };
    } catch (error) {
      console.error("Failed to get room with history:", error);
      return null;
    }
  }

  async getUserRooms(userId: string | null): Promise<PersistedRoom[]> {
    if (typeof window === "undefined") return [];

    try {
      const index = this.getRoomsIndex();
      const rooms: PersistedRoom[] = [];

      for (const roomId of index) {
        const room = await this.getRoomById(roomId);
        if (room && (userId === null || room.creatorId === userId)) {
          rooms.push(room);
        }
      }

      // Sort by most recent activity
      return rooms.sort(
        (a, b) =>
          new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
      );
    } catch (error) {
      console.error("Failed to get user rooms:", error);
      return [];
    }
  }

  async getActiveRooms(userId: string | null): Promise<PersistedRoom[]> {
    const allRooms = await this.getUserRooms(userId);
    return allRooms.filter((room) => room.isActive && !room.isArchived);
  }

  async archiveRoom(roomId: string): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const room = await this.getRoomById(roomId);
      if (room) {
        room.isArchived = true;
        room.isActive = false;
        room.closedAt = new Date().toISOString();
        await this.saveRoom(room);
      }
    } catch (error) {
      console.error("Failed to archive room:", error);
      throw error;
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const key = `${STORAGE_KEY_PREFIX}${roomId}`;
      localStorage.removeItem(key);
      this.removeFromRoomsIndex(roomId);
    } catch (error) {
      console.error("Failed to delete room:", error);
      throw error;
    }
  }

  async addSubmissionToRoom(roomId: string, submission: SubmissionResult): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const room = await this.getRoomById(roomId);
      if (room) {
        room.submissionIds.push(submission.id);
        room.totalSubmissions++;
        if (submission.status === "success") {
          room.successfulSubmissions++;
        }
        room.lastActivityAt = new Date().toISOString();
        room.updatedAt = new Date().toISOString();
        await this.saveRoom(room);
      }
    } catch (error) {
      console.error("Failed to add submission to room:", error);
      throw error;
    }
  }

  // ─── Helper Methods ───────────────────────────────────────────────

  private getRoomsIndex(): string[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(ROOMS_INDEX_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private updateRoomsIndex(roomId: string): void {
    if (typeof window === "undefined") return;

    try {
      const index = this.getRoomsIndex();
      if (!index.includes(roomId)) {
        index.push(roomId);
        localStorage.setItem(ROOMS_INDEX_KEY, JSON.stringify(index));
      }
    } catch (error) {
      console.error("Failed to update rooms index:", error);
    }
  }

  private removeFromRoomsIndex(roomId: string): void {
    if (typeof window === "undefined") return;

    try {
      const index = this.getRoomsIndex().filter((id) => id !== roomId);
      localStorage.setItem(ROOMS_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error("Failed to remove from rooms index:", error);
    }
  }
}

// Singleton instance
let storageInstance: LocalRoomStorage | null = null;

export function getRoomStorage(): RoomStorage {
  if (!storageInstance) {
    storageInstance = new LocalRoomStorage();
  }
  return storageInstance;
}
