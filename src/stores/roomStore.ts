import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SupportedLanguage, Participant, SubmissionResult, RoomMeta, RoomAccessLevel } from "@/types/room";

interface RoomState {
  // Room identification
  roomId: string;
  language: SupportedLanguage;
  problemSlug: string | null;
  participants: Participant[];
  lastSubmission: SubmissionResult | null;
  submissionHistory: SubmissionResult[];

  // Room ownership & access control
  roomMeta: RoomMeta | null;
  isRoomCreator: boolean;
  roomAccessLevel: RoomAccessLevel;

  // Actions
  setRoomId: (id: string) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setProblemSlug: (slug: string | null) => void;
  setParticipants: (participants: Participant[]) => void;
  setLastSubmission: (submission: SubmissionResult | null) => void;
  addSubmission: (submission: SubmissionResult) => void;
  clearSubmissionHistory: () => void;
  setRoomMeta: (meta: RoomMeta | null) => void;
  setIsRoomCreator: (isCreator: boolean) => void;
  setRoomAccessLevel: (level: RoomAccessLevel) => void;
}

export const useRoomStore = create<RoomState, [["zustand/persist", unknown]]>(
  persist(
    (set) => ({
      // Room identification
      roomId: "",
      language: "python",
      problemSlug: null,
      participants: [],
      lastSubmission: null,
      submissionHistory: [],

      // Room ownership & access control
      roomMeta: null,
      isRoomCreator: false,
      roomAccessLevel: "PUBLIC" as RoomAccessLevel,

      // Actions
      setRoomId: (id) => set({ roomId: id }),
      setLanguage: (language) => set({ language }),
      setProblemSlug: (problemSlug) => set({ problemSlug }),
      setParticipants: (participants) => set({ participants }),
      setLastSubmission: (lastSubmission) => set({ lastSubmission }),
      addSubmission: (submission) =>
        set((state) => ({
          lastSubmission: submission,
          submissionHistory: [submission, ...state.submissionHistory],
        })),
      clearSubmissionHistory: () => set({ submissionHistory: [], lastSubmission: null }),
      setRoomMeta: (roomMeta) => set({ roomMeta }),
      setIsRoomCreator: (isRoomCreator) => set({ isRoomCreator }),
      setRoomAccessLevel: (roomAccessLevel) => set({ roomAccessLevel }),
    }),
    {
      name: "room-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
        problemSlug: state.problemSlug,
        submissionHistory: state.submissionHistory,
      }),
    }
  )
);
