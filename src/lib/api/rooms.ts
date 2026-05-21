import type { Room } from "@/types/room";

/**
 * Fetch user's rooms (created and joined)
 */
export async function getUserRooms(): Promise<Room[]> {
  try {
    const response = await fetch("/api/users/me/rooms", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rooms: ${response.statusText}`);
    }

    const data = await response.json();
    return data.rooms || [];
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
}

/**
 * Fetch room details by ID
 */
export async function getRoom(roomId: string): Promise<Room> {
  try {
    const response = await fetch(
      `/api/rooms/${encodeURIComponent(roomId)}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch room: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching room:", error);
    throw error;
  }
}

/**
 * Create a new room
 */
export async function createRoom(data: {
  title: string;
  problemSlug?: string;
  language?: string;
  accessLevel?: "PUBLIC" | "INVITE" | "PRIVATE";
}): Promise<Room> {
  try {
    const response = await fetch("/api/rooms", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create room: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
}

/**
 * Join a room
 */
export async function joinRoom(roomId: string): Promise<Room> {
  try {
    const response = await fetch(
      `/api/rooms/${encodeURIComponent(roomId)}/join`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to join room: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error joining room:", error);
    throw error;
  }
}

/**
 * Update room metadata (creator only)
 */
export async function updateRoom(
  roomId: string,
  updates: {
    title?: string;
    accessLevel?: "PUBLIC" | "INVITE" | "PRIVATE";
  }
): Promise<Room> {
  try {
    const response = await fetch(
      `/api/rooms/${encodeURIComponent(roomId)}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update room: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
}

/**
 * Delete a room (creator only)
 */
export async function deleteRoom(roomId: string): Promise<void> {
  try {
    const response = await fetch(
      `/api/rooms/${encodeURIComponent(roomId)}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete room: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
}
