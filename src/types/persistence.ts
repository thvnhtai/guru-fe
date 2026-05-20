import type { SupportedLanguage, SubmissionResult } from "./room";

/**
 * Represents a persisted room snapshot
 * This is what gets saved to storage (backend or localStorage)
 */
export interface PersistedRoom {
  id: string;
  creatorId: string | null; // null for anonymous rooms
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  closedAt?: string; // ISO timestamp when room was closed (optional)
  language: SupportedLanguage;
  problemSlug?: string | null;
  code: string; // Final code state
  title?: string;
  description?: string;

  // Room state
  isArchived: boolean;
  isActive: boolean; // Whether room is currently open

  // Metadata
  submissionIds: string[]; // References to submissions
  participantCount: number;
  lastActivityAt: string; // ISO timestamp

  // Statistics
  totalSubmissions: number;
  successfulSubmissions: number;
}

/**
 * Room with full submission history (for detailed view)
 */
export interface PersistedRoomWithHistory extends PersistedRoom {
  submissions: SubmissionResult[];
}

/**
 * Storage interface for room persistence
 * Abstracts the storage backend (localStorage, backend API, etc.)
 */
export interface RoomStorage {
  // Save/update a room
  saveRoom(room: PersistedRoom): Promise<void>;

  // Get room by ID
  getRoomById(roomId: string): Promise<PersistedRoom | null>;

  // Get room with full submission history
  getRoomWithHistory(roomId: string): Promise<PersistedRoomWithHistory | null>;

  // Get all rooms for a user
  getUserRooms(userId: string | null): Promise<PersistedRoom[]>;

  // Get active rooms (not archived)
  getActiveRooms(userId: string | null): Promise<PersistedRoom[]>;

  // Archive a room
  archiveRoom(roomId: string): Promise<void>;

  // Delete a room (hard delete)
  deleteRoom(roomId: string): Promise<void>;

  // Add submission to room
  addSubmissionToRoom(roomId: string, submission: SubmissionResult): Promise<void>;
}

/**
 * Room archival request
 * Sent when a room should be archived (e.g., last user leaves)
 */
export interface RoomArchivalRequest {
  roomId: string;
  finalCode: string;
  finalSubmissions: SubmissionResult[];
  closedAt: string;
  participantCount: number;
}

/**
 * Room recovery request
 * Sent when a user wants to restart an archived room
 */
export interface RoomRecoveryRequest {
  archivedRoomId: string;
  userId: string | null;
  newRoomId: string; // New room ID for the recovered session
}
