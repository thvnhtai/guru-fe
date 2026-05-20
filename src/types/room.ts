export type SupportedLanguage = "python" | "javascript" | "java" | "cpp";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "python",
  "javascript",
  "java",
  "cpp",
];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
};

export const FILE_EXTENSIONS: Record<SupportedLanguage, string> = {
  python: ".py",
  javascript: ".js",
  java: ".java",
  cpp: ".cpp",
};

export const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "cpp",
};

export interface Participant {
  sessionId: string;
  name: string;
  color: string;
  joinedAt: string;
  isOnline: boolean;
}

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  problemSlug: string | null;
  language: SupportedLanguage;
  participants: Participant[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderName: string;
  senderColor: string;
  content: string;
  timestamp: string;
}

export interface CreateRoomPayload {
  name: string;
  language?: SupportedLanguage;
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface TestResult {
  passed: boolean;
  output?: string;
  expected: string;
  error?: string;
  runtime?: number;
  memory?: number;
}

export interface SubmissionResult {
  id: string;
  timestamp: string;
  language: SupportedLanguage;
  code: string;
  status: "pending" | "running" | "success" | "error";
  totalTests: number;
  passedTests: number;
  testResults: TestResult[];
  executionTime?: number;
  totalMemory?: number;
}

export interface SessionStats {
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  passRate: number; // 0-100
  languagesUsed: Set<SupportedLanguage>;
  totalTestsPassed: number;
  totalTestsFailed: number;
  topContributor: { name: string; count: number } | null;
  sessionDurationSeconds: number;
  avgExecutionTime: number;
}

export type RoomAccessLevel = "PUBLIC" | "INVITE" | "PRIVATE";

export interface RoomMeta {
  id: string;
  creatorId: string | null; // null for anonymous rooms
  createdAt: string;
  accessLevel: RoomAccessLevel;
  title?: string;
  description?: string;
  participantIds: string[]; // sessionIds or userIds
}

export interface RoomAccessRequest {
  roomId: string;
  sessionId: string;
  userId?: string; // optional if authenticated
}

export interface RoomAccessResponse {
  granted: boolean;
  meta?: RoomMeta;
  reason?: string; // why access was denied
}
