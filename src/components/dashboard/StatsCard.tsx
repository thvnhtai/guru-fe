import { useDashboardStats } from "@/lib/hooks/useDashboardData";
import { formatDuration, formatRelativeTime } from "@/lib/utils/stats";
import { LANGUAGE_LABELS } from "@/types/room";

export function StatsCard() {
  const { stats, loading, error } = useDashboardStats();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Your Stats</h3>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
          <p className="text-xs text-amber-700">
            Unable to load stats. Using cached data.
          </p>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Grid */}
          <div className="space-y-3">
            {/* Problems Solved */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Problems solved</span>
              <span className="text-lg font-bold text-blue-600">
                {stats.problemsSolved}
              </span>
            </div>

            {/* Total Rooms */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total rooms</span>
              <span className="text-lg font-bold text-purple-600">
                {stats.totalRooms}
              </span>
            </div>

            {/* Collaboration Time */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Time spent coding</span>
              <span className="text-lg font-bold text-green-600">
                {formatDuration(stats.totalCollaborationTime)}
              </span>
            </div>

            {/* Last Activity */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last activity</span>
              <span className="text-sm text-gray-500">
                {stats.lastActivity === "Never"
                  ? "Never"
                  : formatRelativeTime(stats.lastActivity)}
              </span>
            </div>
          </div>

          {/* Languages */}
          {stats.languagesPracticed.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">Languages</h4>
              <div className="flex flex-wrap gap-1">
                {stats.languagesPracticed.map((lang) => (
                  <span
                    key={lang}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                  >
                    {LANGUAGE_LABELS[lang]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
