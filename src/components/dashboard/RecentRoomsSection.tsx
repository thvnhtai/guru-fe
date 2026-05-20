import { useRecentRooms } from "@/lib/hooks/useDashboardData";
import { RoomCard } from "./RoomCard";

export function RecentRoomsSection() {
  const rooms = useRecentRooms();

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
      <h2 className="text-lg font-semibold text-gray-900">Recent Rooms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
