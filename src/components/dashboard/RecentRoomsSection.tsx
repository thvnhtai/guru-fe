import { useRecentRooms } from "@/lib/hooks/useDashboardData";
import { RoomCard } from "./RoomCard";

export function RecentRoomsSection({ title = "Recent Rooms" }: { title?: string } = {}) {
  const { rooms, loading, error } = useRecentRooms();

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 border border-gray-200 rounded-lg p-4 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && rooms.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="bg-white border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-red-900 mb-1">
              Unable to load rooms
            </p>
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">
            No rooms yet
          </p>
          <p className="text-sm text-gray-500">
            Create your first room to start collaborating
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
