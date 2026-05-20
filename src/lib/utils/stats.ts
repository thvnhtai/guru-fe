import type { SubmissionResult, SupportedLanguage } from "@/types/room";

/**
 * Calculate the number of problems solved (successful submissions)
 */
export function calculateProblemsSolved(submissionHistory: SubmissionResult[]): number {
  if (!submissionHistory || submissionHistory.length === 0) return 0;

  // Count unique problems with successful submissions
  const solvedProblems = new Set<string>();

  submissionHistory.forEach((submission) => {
    if (submission.status === "success" && submission.passedTests > 0) {
      // Use timestamp as pseudo room/problem identifier since we don't have direct problem tracking
      // In production, this would track unique problem slugs
      solvedProblems.add(`${submission.language}-${submission.timestamp}`);
    }
  });

  return solvedProblems.size;
}

/**
 * Get list of languages practiced
 */
export function getLanguagesPracticed(submissionHistory: SubmissionResult[]): SupportedLanguage[] {
  if (!submissionHistory || submissionHistory.length === 0) return [];

  const languages = new Set<SupportedLanguage>();
  submissionHistory.forEach((submission) => {
    languages.add(submission.language);
  });

  return Array.from(languages).sort();
}

/**
 * Calculate total collaboration time in seconds
 * Estimates based on submission history timestamps
 */
export function calculateTotalCollaborationTime(submissionHistory: SubmissionResult[]): number {
  if (!submissionHistory || submissionHistory.length === 0) return 0;

  // Group submissions by timestamp (room session)
  const sessions = new Map<string, SubmissionResult[]>();

  submissionHistory.forEach((submission) => {
    // Extract date from timestamp to group by session
    const isoString = new Date(submission.timestamp).toISOString();
    const date = isoString.substring(0, 10); // Extract YYYY-MM-DD
    if (!sessions.has(date)) {
      sessions.set(date, []);
    }
    sessions.get(date)!.push(submission);
  });

  // Estimate: 10 minutes per submission as average coding session duration
  // This is a rough estimate; production would track actual session times
  let totalSeconds = 0;
  sessions.forEach((submissions) => {
    totalSeconds += submissions.length * 600; // 10 minutes per submission
  });

  return totalSeconds;
}

/**
 * Get the timestamp of the most recent submission
 */
export function getLastActivity(submissionHistory: SubmissionResult[]): string {
  if (!submissionHistory || submissionHistory.length === 0) return "Never";

  const lastSubmission = submissionHistory[0];
  return lastSubmission?.timestamp || "Never"; // Submissions are stored newest first
}

/**
 * Format seconds into human-readable duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

/**
 * Format ISO timestamp into relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const now = new Date();
  const then = new Date(isoTimestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;

  return then.toLocaleDateString();
}
