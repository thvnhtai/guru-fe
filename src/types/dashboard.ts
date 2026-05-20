import type { SupportedLanguage, SubmissionResult } from "./room";

/**
 * Represents a room in the dashboard (lightweight view of room metadata)
 */
export interface DashboardRoom {
  id: string;
  problemSlug?: string;
  problemTitle?: string;
  language: SupportedLanguage;
  lastEdited: string; // ISO timestamp
  participantsCount: number;
  submissionsCount: number;
  status: "pending" | "running" | "success" | "error";
}

/**
 * Aggregated statistics for the user's dashboard
 */
export interface DashboardStats {
  totalRooms: number;
  problemsSolved: number;
  languagesPracticed: SupportedLanguage[];
  totalCollaborationTime: number; // in seconds
  lastActivity: string; // ISO timestamp or "Never"
}
