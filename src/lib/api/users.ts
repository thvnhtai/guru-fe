import type { User } from "@/types/auth";

export interface UserStats {
  userId: string;
  problemsSolved: number;
  languagesPracticed: string[];
  totalCollaborationTime: number; // seconds
  lastActivityAt: string;
  totalRooms: number;
  successfulSubmissions: number;
}

/**
 * Fetch current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await fetch("/api/users/me", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

/**
 * Fetch user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const response = await fetch("/api/users/me/stats", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUser(
  updates: Partial<User>
): Promise<User> {
  try {
    const response = await fetch("/api/users/me", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}
