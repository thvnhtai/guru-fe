"use client";

import { useState } from "react";
import { useSessionStats } from "@/lib/hooks/useSessionStats";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function SessionStatsPanel() {
  const stats = useSessionStats();
  const [expanded, setExpanded] = useState(true);

  if (stats.totalSubmissions === 0 && !expanded) {
    return null;
  }

  return (
    <div className="flex flex-col border-t border-gray-100 overflow-hidden bg-white">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 pt-3 pb-2 hover:bg-gray-50 transition-colors"
      >
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Session Stats
        </span>
        <span className="text-xs text-gray-400 ml-auto">
          {expanded ? "▾" : "▸"}
        </span>
      </button>

      {expanded && (
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
          {stats.totalSubmissions === 0 ? (
            <p className="text-xs text-gray-400 py-2">No submissions yet</p>
          ) : (
            <>
              {/* Submissions */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Total submissions</span>
                  <span className="font-semibold text-gray-900">{stats.totalSubmissions}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Successful</span>
                  <span className="font-semibold text-green-600">{stats.successfulSubmissions}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Failed</span>
                  <span className="font-semibold text-red-600">{stats.failedSubmissions}</span>
                </div>
              </div>

              {/* Pass rate bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Pass rate</span>
                  <span className="font-semibold text-gray-900">{stats.passRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      stats.passRate >= 80
                        ? "bg-green-500"
                        : stats.passRate >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${stats.passRate}%` }}
                  />
                </div>
              </div>

              {/* Test results */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Tests passed</span>
                  <span className="font-semibold text-green-600">{stats.totalTestsPassed}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Tests failed</span>
                  <span className="font-semibold text-red-600">{stats.totalTestsFailed}</span>
                </div>
              </div>

              {/* Languages */}
              {stats.languagesUsed.size > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Languages used</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(stats.languagesUsed).map((lang) => (
                      <span
                        key={lang}
                        className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top contributor */}
              {stats.topContributor && (
                <div className="bg-blue-50 border border-blue-100 rounded-md p-2">
                  <p className="text-[10px] text-blue-600 mb-1">Top contributor</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-blue-900">
                      {stats.topContributor.name}
                    </span>
                    <span className="text-xs text-blue-700">
                      {stats.topContributor.count} submission{stats.topContributor.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Session time and perf */}
              <div className="space-y-1 border-t border-gray-100 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Session duration</span>
                  <span className="font-semibold text-gray-900">
                    {formatDuration(stats.sessionDurationSeconds)}
                  </span>
                </div>
                {stats.avgExecutionTime > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Avg execution time</span>
                    <span className="font-semibold text-gray-900">{stats.avgExecutionTime}ms</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
