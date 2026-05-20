"use client";

import { useRoomStore } from "@/stores/roomStore";
import { useUserStore } from "@/stores/userStore";
import type { Participant } from "@/types/room";

interface ParticipantItemProps {
  participant: Participant;
  isLocal: boolean;
}

function ParticipantItem({ participant, isLocal }: ParticipantItemProps) {
  const initial = participant.name?.[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex items-center gap-2.5 py-1">
      {/* Colored avatar with initial */}
      <span
        className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white select-none"
        style={{ backgroundColor: participant.color }}
        aria-hidden="true"
      >
        {initial}
      </span>

      <span className="text-xs text-gray-700 truncate flex-1">
        {participant.name}
        {isLocal && (
          <span className="text-gray-400 ml-1.5 font-normal">you</span>
        )}
      </span>

      {participant.isOnline && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"
          aria-label="Online"
        />
      )}
    </div>
  );
}

export function ParticipantList() {
  const { participants } = useRoomStore();
  const { sessionId, name, color } = useUserStore();

  const localParticipant: Participant = {
    sessionId,
    name: name || "You",
    color,
    joinedAt: new Date().toISOString(),
    isOnline: true,
  };

  const allParticipants = [
    localParticipant,
    ...participants.filter((p) => p.sessionId !== sessionId),
  ];

  return (
    <div className="px-3 pt-3 pb-2">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
        Participants ({allParticipants.length})
      </p>
      <div>
        {allParticipants.map((p) => (
          <ParticipantItem
            key={p.sessionId}
            participant={p}
            isLocal={p.sessionId === sessionId}
          />
        ))}
      </div>
    </div>
  );
}
