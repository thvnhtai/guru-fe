import { useRouter } from "next/navigation";
import type { DashboardRoom } from "@/types/dashboard";
import { LANGUAGE_LABELS } from "@/types/room";
import { formatRelativeTime } from "@/lib/utils/stats";

interface RoomCardProps {
  room: DashboardRoom;
}

const languageColors: Record<string, string> = {
  python: "bg-blue-100 text-blue-800",
  javascript: "bg-yellow-100 text-yellow-800",
  java: "bg-red-100 text-red-800",
  cpp: "bg-purple-100 text-purple-800",
};

export function RoomCard({ room }: RoomCardProps) {
  const router = useRouter();

  const handleJoin = () => {
    router.push(`/room/${room.id}`);
  };

  const statusIcon =
    room.status === "success" ? "✓" : room.status === "error" ? "✕" : "•";
  const statusColor =
    room.status === "success"
      ? "text-green-600"
      : room.status === "error"
      ? "text-red-600"
      : "text-gray-400";

  const langColor =
    languageColors[room.language] || "bg-gray-100 text-gray-800";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {room.problemTitle || `Room ${room.id}`}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatRelativeTime(room.lastEdited)}
          </p>
        </div>
        <span className={`text-lg font-semibold ${statusColor}`}>
          {statusIcon}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-1 rounded ${langColor}`}>
          {LANGUAGE_LABELS[room.language]}
        </span>
        <span className="text-xs text-gray-500">
          {room.submissionsCount} submission{room.submissionsCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={handleJoin}
        className="w-full py-2 px-3 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        Join Room
      </button>
    </div>
  );
}
