"use client";

import { useRoomStore } from "@/stores/roomStore";
import { LANGUAGE_LABELS, type SubmissionResult } from "@/types/room";

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getStatusBadge(submission: SubmissionResult): { text: string; color: string } {
  if (submission.status === "error") {
    return { text: "✗ Error", color: "text-red-600 bg-red-50" };
  }
  if (submission.status === "running") {
    return { text: "⏳ Running", color: "text-yellow-600 bg-yellow-50" };
  }
  if (submission.totalTests === 0) {
    return { text: "✓ Success", color: "text-green-600 bg-green-50" };
  }
  if (submission.passedTests === submission.totalTests) {
    return { text: "✓ All passed", color: "text-green-600 bg-green-50" };
  }
  return { text: `◐ ${submission.passedTests}/${submission.totalTests}`, color: "text-amber-600 bg-amber-50" };
}

interface Props {
  onRevert?: (code: string) => void;
}

export function SubmissionHistoryPanel({ onRevert }: Props) {
  const { submissionHistory } = useRoomStore();

  if (submissionHistory.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-3 py-4 flex items-center justify-center">
        <p className="text-xs text-gray-400">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-gray-100 overflow-hidden bg-white flex-1">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-100">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Submission History
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {submissionHistory.map((submission) => {
          const statusBadge = getStatusBadge(submission);
          return (
            <div
              key={submission.id}
              className="border border-gray-200 rounded-md p-2.5 space-y-1.5 hover:border-gray-300 transition-colors"
            >
              {/* Timestamp + Language */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-500">
                  {formatRelativeTime(submission.timestamp)}
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                  {LANGUAGE_LABELS[submission.language]}
                </span>
              </div>

              {/* Status badge */}
              <div>
                <span
                  className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded ${statusBadge.color}`}
                >
                  {statusBadge.text}
                </span>
              </div>

              {/* Test summary */}
              {submission.totalTests > 0 && (
                <div className="text-[10px] text-gray-600">
                  {submission.passedTests}/{submission.totalTests} tests passed
                </div>
              )}

              {/* Execution time */}
              {submission.executionTime !== undefined && (
                <div className="text-[10px] text-gray-500">
                  ⏱ {submission.executionTime}ms
                </div>
              )}

              {/* Revert button */}
              {onRevert && (
                <button
                  onClick={() => onRevert(submission.code)}
                  className="w-full text-[10px] py-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors font-medium mt-1"
                >
                  ↻ Revert
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
