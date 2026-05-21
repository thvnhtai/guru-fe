import { useState, useEffect, useMemo } from "react";
import { useRoomStore } from "@/stores/roomStore";
import type { DashboardRoom, DashboardStats } from "@/types/dashboard";
import * as roomsApi from "@/lib/api/rooms";
import * as usersApi from "@/lib/api/users";
import {
  calculateProblemsSolved,
  getLanguagesPracticed,
  calculateTotalCollaborationTime,
  getLastActivity,
} from "@/lib/utils/stats";
import type { SubmissionResult } from "@/types/room";

interface UseRecentRoomsReturn {
  rooms: DashboardRoom[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get recent rooms from API
 * Returns the most recent rooms (up to 10) with metadata
 */
export function useRecentRooms(): UseRecentRoomsReturn {
  const [rooms, setRooms] = useState<DashboardRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { submissionHistory } = useRoomStore(); // Fallback to local data if API fails

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const data = await roomsApi.getUserRooms();
        // Convert Room objects to DashboardRoom format
        const dashboardRooms: DashboardRoom[] = data.slice(0, 10).map((room) => ({
          id: room.id,
          problemSlug: room.problemSlug || undefined,
          language: room.language,
          lastEdited: room.createdAt,
          participantsCount: typeof room.participants === 'number' ? room.participants : room.participants?.length || 1,
          submissionsCount: 0, // Would need separate submission history call
          status: "success",
        }));
        setRooms(dashboardRooms);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load rooms";
        setError(errorMsg);
        // Fallback to local submission history if API fails
        if (submissionHistory && submissionHistory.length > 0) {
          const roomMap = new Map<string, SubmissionResult[]>();
          submissionHistory.forEach((submission) => {
            const isoString = new Date(submission.timestamp).toISOString();
            const date = isoString.substring(0, 10);
            if (!roomMap.has(date)) {
              roomMap.set(date, []);
            }
            roomMap.get(date)!.push(submission);
          });

          const fallbackRooms: DashboardRoom[] = Array.from(roomMap.entries())
            .filter(([, submissions]) => submissions.length > 0)
            .map(([date, submissions]) => {
              const firstSubmission = submissions[0];
              return {
                id: date,
                language: firstSubmission!.language,
                lastEdited: firstSubmission!.timestamp,
                participantsCount: 1,
                submissionsCount: submissions.length,
                status: firstSubmission!.status || "pending",
              };
            })
            .slice(0, 10);
          setRooms(fallbackRooms);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [submissionHistory]);

  return { rooms, loading, error };
}

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get dashboard statistics from API
 * Falls back to calculated stats from submission history if API fails
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    problemsSolved: 0,
    languagesPracticed: [],
    totalCollaborationTime: 0,
    lastActivity: "Never",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { submissionHistory } = useRoomStore(); // Fallback to local data

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await usersApi.getUserStats();
        setStats({
          totalRooms: data.totalRooms,
          problemsSolved: data.problemsSolved,
          languagesPracticed: data.languagesPracticed as any,
          totalCollaborationTime: data.totalCollaborationTime,
          lastActivity: data.lastActivityAt,
        });
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load stats";
        setError(errorMsg);
        // Fallback to local calculation if API fails
        if (submissionHistory && submissionHistory.length > 0) {
          const problemsSolved = calculateProblemsSolved(submissionHistory);
          const languagesPracticed = getLanguagesPracticed(submissionHistory);
          const totalTime = calculateTotalCollaborationTime(submissionHistory);
          const lastActivity = getLastActivity(submissionHistory);

          setStats({
            totalRooms: new Set(
              submissionHistory.map((s) =>
                new Date(s.timestamp).toISOString().split('T')[0]
              )
            ).size,
            problemsSolved,
            languagesPracticed,
            totalCollaborationTime: totalTime,
            lastActivity,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [submissionHistory]);

  return { stats, loading, error };
}

/**
 * Hook to get user room history for the dashboard
 * Connects to backend API in Phase 14A
 */
export function useUserRoomHistory(): UseRecentRoomsReturn {
  return useRecentRooms();
}
