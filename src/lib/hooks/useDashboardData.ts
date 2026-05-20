import { useMemo } from "react";
import { useRoomStore } from "@/stores/roomStore";
import type { DashboardRoom, DashboardStats } from "@/types/dashboard";
import {
  calculateProblemsSolved,
  getLanguagesPracticed,
  calculateTotalCollaborationTime,
  getLastActivity,
} from "@/lib/utils/stats";

/**
 * Hook to get recent rooms from submission history
 * Returns the most recent rooms (up to 10) with metadata
 */
export function useRecentRooms(): DashboardRoom[] {
  const { submissionHistory, roomId } = useRoomStore();

  return useMemo(() => {
    if (!submissionHistory || submissionHistory.length === 0) return [];

    // Group submissions by timestamp (approximate room sessions)
    // In production, this would use actual room IDs
    const roomMap = new Map<string, typeof submissionHistory[0][]>();

    submissionHistory.forEach((submission) => {
      // Use date as session key for grouping
      const isoString = new Date(submission.timestamp).toISOString();
      const date = isoString.substring(0, 10); // Extract YYYY-MM-DD
      if (!roomMap.has(date)) {
        roomMap.set(date, []);
      }
      roomMap.get(date)!.push(submission);
    });

    // Convert to DashboardRoom format
    const rooms: DashboardRoom[] = Array.from(roomMap.entries())
      .filter(([, submissions]) => submissions.length > 0)
      .map(([date, submissions]) => {
        const firstSubmission = submissions[0];
        return {
          id: date, // Use date as ID for now
          language: firstSubmission!.language,
          lastEdited: firstSubmission!.timestamp,
          participantsCount: 1, // Mock: would be tracked in actual room data
          submissionsCount: submissions.length,
          status: firstSubmission!.status || "pending",
        };
      })
      .slice(0, 10); // Limit to 10 most recent

    return rooms;
  }, [submissionHistory]);
}

/**
 * Hook to get dashboard statistics
 * Calculates aggregated stats from submission history
 */
export function useDashboardStats(): DashboardStats {
  const { submissionHistory } = useRoomStore();

  return useMemo(() => {
    const problemsSolved = calculateProblemsSolved(submissionHistory);
    const languagesPracticed = getLanguagesPracticed(submissionHistory);
    const totalTime = calculateTotalCollaborationTime(submissionHistory);
    const lastActivity = getLastActivity(submissionHistory);

    return {
      totalRooms: new Set(
        submissionHistory.map((s) =>
          new Date(s.timestamp).toISOString().split('T')[0]
        )
      ).size,
      problemsSolved,
      languagesPracticed,
      totalCollaborationTime: totalTime,
      lastActivity,
    };
  }, [submissionHistory]);
}

/**
 * Hook to get user room history for the dashboard
 * Currently pulls from local store, will connect to backend API in Phase 11
 */
export function useUserRoomHistory(): DashboardRoom[] {
  return useRecentRooms();
}
