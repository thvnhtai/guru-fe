import { useMemo } from "react";
import { useRoomStore } from "@/stores/roomStore";
import { useUserStore } from "@/stores/userStore";
import type { SessionStats } from "@/types/room";

/**
 * useSessionStats
 * Computes session analytics from submission history and participants
 */
export function useSessionStats(): SessionStats {
  const { submissionHistory, participants } = useRoomStore();
  const { sessionId: mySessionId } = useUserStore();

  return useMemo(() => {
    const stats: SessionStats = {
      totalSubmissions: submissionHistory.length,
      successfulSubmissions: submissionHistory.filter((s) => s.status === "success").length,
      failedSubmissions: submissionHistory.filter((s) => s.status === "error").length,
      passRate: 0,
      languagesUsed: new Set(),
      totalTestsPassed: 0,
      totalTestsFailed: 0,
      topContributor: null,
      sessionDurationSeconds: 0,
      avgExecutionTime: 0,
    };

    // Compute pass rate and test results
    if (submissionHistory.length > 0) {
      submissionHistory.forEach((sub) => {
        stats.totalTestsPassed += sub.passedTests;
        stats.totalTestsFailed += sub.totalTests - sub.passedTests;
        stats.languagesUsed.add(sub.language);
      });

      const totalTests = stats.totalTestsPassed + stats.totalTestsFailed;
      stats.passRate = totalTests > 0 ? Math.round((stats.totalTestsPassed / totalTests) * 100) : 0;

      // Compute average execution time
      const successfulWithTime = submissionHistory.filter((s) => s.executionTime !== undefined);
      if (successfulWithTime.length > 0) {
        const sumTime = successfulWithTime.reduce((sum, s) => sum + (s.executionTime ?? 0), 0);
        stats.avgExecutionTime = Math.round(sumTime / successfulWithTime.length);
      }
    }

    // Compute top contributor (most submissions)
    if (submissionHistory.length > 0) {
      const submissionsByUser: Record<string, number> = {};
      submissionHistory.forEach((sub) => {
        // Try to find participant with this session ID
        const participant = participants.find((p) => p.sessionId === sub.id);
        const name = participant?.name || "Unknown";
        submissionsByUser[name] = (submissionsByUser[name] ?? 0) + 1;
      });

      let topName = null;
      let topCount = 0;
      Object.entries(submissionsByUser).forEach(([name, count]) => {
        if (count > topCount) {
          topCount = count;
          topName = name;
        }
      });

      if (topName && topCount > 0) {
        stats.topContributor = { name: topName, count: topCount };
      }
    }

    // Compute session duration (from first to last submission)
    if (submissionHistory.length > 0) {
      const firstSubmission = submissionHistory[submissionHistory.length - 1];
      const lastSubmission = submissionHistory[0];
      if (firstSubmission && lastSubmission) {
        const first = new Date(firstSubmission.timestamp);
        const last = new Date(lastSubmission.timestamp);
        stats.sessionDurationSeconds = Math.round((last.getTime() - first.getTime()) / 1000);
      }
    }

    return stats;
  }, [submissionHistory, participants]);
}
