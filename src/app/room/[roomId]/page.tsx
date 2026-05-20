"use client";

import { use, useCallback, useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Splitter } from "antd";
import { RoomHeader } from "@/components/room/RoomHeader";
import { ChatPanel } from "@/components/room/ChatPanel";
import { TestResultsPanel } from "@/components/room/TestResultsPanel";
import { SessionStatsPanel } from "@/components/room/SessionStatsPanel";
import { SubmissionHistoryPanel } from "@/components/room/SubmissionHistoryPanel";
import { runCode } from "@/lib/api/leetcode";
import { CODE_TEMPLATES } from "@/lib/templates";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { useRoomAutoSave, useRoomArchival } from "@/lib/hooks/useRoomAutoSave";
// CollaborativeEditor imports monaco-editor which references `window` at module
// evaluation time — must be client-only (ssr: false) to avoid "window is not defined".
const CollaborativeEditor = dynamic(
  () =>
    import("@/components/editor/CollaborativeEditor").then(
      (m) => m.CollaborativeEditor
    ),
  { ssr: false }
);
import { ProblemStatement } from "@/components/problem/ProblemStatement";
import { useRouter } from "next/navigation";
import { useRoomStore } from "@/stores/roomStore";
import { useUserStore } from "@/stores/userStore";
import { useYjsRoom } from "@/lib/yjs/hooks";
import { setRoomMetaLanguage, setRoomMetaProblemSlug } from "@/lib/yjs/provider";
import { useProblem } from "@/lib/api/useProblem";
import { FILE_EXTENSIONS, type SupportedLanguage, type RoomAccessResponse } from "@/types/room";
import type { YjsChatMessage } from "@/types/yjs";

// ParticipantList reads sessionStorage via userStore — must be client-only to
// avoid a server/client sessionId mismatch that causes a hydration error.
const ParticipantList = dynamic(
  () => import("@/components/room/ParticipantList").then((m) => m.ParticipantList),
  { ssr: false }
);

// ── Inner component — uses useSearchParams, so it must be inside <Suspense> ──
// Next.js App Router requires that any component calling useSearchParams()
// is wrapped in a Suspense boundary.
function RoomWorkspace({ roomId }: { roomId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const observerToken = searchParams.get("observer");
  const isObserver = observerToken !== null;
  const { setRoomId, problemSlug, language, lastSubmission, addSubmission, setRoomMeta, setIsRoomCreator, setRoomAccessLevel } = useRoomStore();
  const { user } = useUserStore();
  const [isRunning, setIsRunning] = useState(false);
  const [templateApplied, setTemplateApplied] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [roomAccessValidated, setRoomAccessValidated] = useState(false);

  useEffect(() => {
    setRoomId(roomId);
  }, [roomId, setRoomId]);

  // ── Validate room access before allowing collaboration ─────────────────────
  useEffect(() => {
    const validateRoomAccess = async () => {
      try {
        const response = await fetch(`/api/rooms?roomId=${roomId}`, {
          method: "GET",
          credentials: "include",
        });

        const data: RoomAccessResponse = await response.json();

        if (!data.granted) {
          // Access denied
          console.warn("Room access denied:", data.reason);
          router.push("/");
          return;
        }

        // Access granted, store room metadata
        if (data.meta) {
          setRoomMeta(data.meta);
          setIsRoomCreator(data.meta.creatorId === user?.id);
        }

        setRoomAccessValidated(true);
      } catch (error) {
        console.error("Room validation error:", error);
        // Allow access to continue (fallback for anonymous rooms)
        setRoomAccessValidated(true);
      }
    };

    validateRoomAccess();
  }, [roomId, user?.id, setRoomMeta, setIsRoomCreator, router]);

  const { contextRef, wsStatus, yText, awareness } = useYjsRoom(roomId);
  const { problem, loading: problemLoading } = useProblem(problemSlug);

  // ── Auto-inject template on first load if editor is empty ────────────────────
  useEffect(() => {
    if (!yText || templateApplied || !contextRef.current) return;
    const currentCode = yText.toString();
    // Only inject template if editor is blank (just whitespace)
    if (!currentCode.trim()) {
      const template = CODE_TEMPLATES[language];
      yText.delete(0, currentCode.length);
      yText.insert(0, template);
      setTemplateApplied(true);
    }
  }, [yText, language, templateApplied, contextRef]);

  // ── Language change: write to Y.Map so all tabs get the update ─────────────
  const handleLanguageChange = useCallback(
    (lang: SupportedLanguage) => {
      if (isObserver) return;
      const doc = contextRef.current?.doc;
      if (doc) setRoomMetaLanguage(doc, lang);
    },
    [contextRef, isObserver]
  );

  // ── Chat send: push to Y.Array so all tabs see the message ─────────────────
  const handleSendMessage = useCallback(
    (content: string) => {
      if (isObserver) return;
      const yChat = contextRef.current?.yChat;
      if (!yChat) return;
      const { name, sessionId, color } = useUserStore.getState();
      const msg: YjsChatMessage = {
        id: crypto.randomUUID(),
        sessionId,
        senderName: name || "Anonymous",
        senderColor: color,
        content,
        timestamp: new Date().toISOString(),
      };
      yChat.push([msg]);
    },
    [contextRef, isObserver]
  );

  // ── Problem load: write slug to Y.Map so all tabs load the problem ──────────
  const handleLoadProblem = useCallback(
    (slug: string | null) => {
      if (isObserver) return;
      const doc = contextRef.current?.doc;
      if (doc) setRoomMetaProblemSlug(doc, slug);
    },
    [contextRef, isObserver]
  );

  // ── Auto-load problem from ?problem= URL param (e.g. from daily challenge) ──
  useEffect(() => {
    if (isObserver) return;
    const slug = searchParams.get("problem");
    if (!slug) return;
    // Wait until the Yjs doc is ready before writing
    const doc = contextRef.current?.doc;
    if (doc) setRoomMetaProblemSlug(doc, slug);
  }, [searchParams, contextRef, yText, isObserver]); // yText becomes non-null once doc is ready

  // ── Export solution: download current editor content as a source file ────────
  const handleExport = useCallback(() => {
    const code = yText?.toString() ?? "";
    const ext = FILE_EXTENSIONS[language];
    const filename = `solution${ext}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [yText, language]);

  // ── Run code: execute against test cases ────────────────────────────────────
  const handleRunCode = useCallback(async () => {
    if (!problemSlug || !yText || isObserver) return;
    const code = yText.toString();
    if (!code.trim()) return;

    setIsRunning(true);
    try {
      const response = await runCode({
        titleSlug: problemSlug,
        code,
        language,
      });

      const now = new Date().toISOString();
      if (response.success && response.testResults) {
        const passedTests = response.testResults.filter((r) => r.passed).length;
        addSubmission({
          id: crypto.randomUUID(),
          timestamp: now,
          language,
          code,
          status: "success",
          totalTests: response.testResults.length,
          passedTests,
          testResults: response.testResults,
        });
      } else {
        addSubmission({
          id: crypto.randomUUID(),
          timestamp: now,
          language,
          code,
          status: "error",
          totalTests: 0,
          passedTests: 0,
          testResults: [],
        });
      }
    } catch (err) {
      addSubmission({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        language,
        code: yText.toString(),
        status: "error",
        totalTests: 0,
        passedTests: 0,
        testResults: [],
      });
    } finally {
      setIsRunning(false);
    }
  }, [problemSlug, yText, language, isObserver, addSubmission]);

  // ── Revert to historical submission ───────────────────────────────────────────
  const handleRevertSubmission = useCallback(
    async (code: string) => {
      if (!yText || isObserver) return;
      // Replace editor content with historical code
      yText.delete(0, yText.length);
      yText.insert(0, code);
      // Automatically run tests on reverted code
      if (problemSlug) {
        setTimeout(() => handleRunCode(), 100);
      }
    },
    [yText, isObserver, problemSlug, handleRunCode]
  );

  // ── Handle access level changes ────────────────────────────────────────────────
  const handleAccessLevelChange = useCallback(
    (newLevel: SupportedLanguage) => {
      setRoomAccessLevel(newLevel as any);
    },
    [setRoomAccessLevel]
  );

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  useKeyboardShortcuts({
    "ctrl+enter": handleRunCode,
    "cmd+enter": handleRunCode,
    "ctrl+s": (e?: Event) => {
      e?.preventDefault?.();
      handleExport();
    },
    "cmd+s": (e?: Event) => {
      e?.preventDefault?.();
      handleExport();
    },
  });

  // ── Auto-save room state during collaboration ────────────────────────────────
  useRoomAutoSave();
  const { archiveRoom } = useRoomArchival();

  // Archive room on unmount (when user leaves)
  useEffect(() => {
    return () => {
      archiveRoom().catch((err) => {
        console.error("Failed to archive room on exit:", err);
      });
    };
  }, [archiveRoom]);

  // Show loading state while validating room access
  if (!roomAccessValidated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Validating room access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <RoomHeader
        onLanguageChange={handleLanguageChange}
        onLoadProblem={handleLoadProblem}
        onExport={handleExport}
        onRunCode={handleRunCode}
        onToggleStats={setStatsVisible}
        onToggleHistory={setHistoryVisible}
        onAccessLevelChange={handleAccessLevelChange}
        readOnly={isObserver}
        isRunning={isRunning}
        statsVisible={statsVisible}
        historyVisible={historyVisible}
      />

      {/* Observer mode banner */}
      {isObserver && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-1.5 text-xs text-blue-600 text-center shrink-0">
          Observer mode — you can watch but not edit
        </div>
      )}

      {/* Connection status banner */}
      {wsStatus === "connecting" && (
        <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-1.5 text-xs text-yellow-700 text-center shrink-0">
          Connecting to collaboration server…
        </div>
      )}
      {wsStatus === "reconnecting" && (
        <div className="bg-orange-50 border-b border-orange-100 px-4 py-1.5 text-xs text-orange-700 text-center shrink-0">
          Connection lost — reconnecting…
        </div>
      )}

      {/* Three-panel layout — resizable via Splitter */}
      <div className="flex-1 overflow-hidden">
        <Splitter style={{ height: "100%" }}>
          {/* Left: Problem statement */}
          <Splitter.Panel defaultSize={380} min={220} max={560}>
            <div className="h-full bg-white overflow-y-auto">
              {problemLoading ? (
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-100 rounded-md animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-md animate-pulse w-1/4" />
                  <div className="h-32 bg-gray-100 rounded-md animate-pulse" />
                </div>
              ) : problem ? (
                <ProblemStatement problem={problem} />
              ) : (
                <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm font-medium text-gray-500">No problem loaded</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Use &ldquo;Load problem&rdquo; or browse the Problems page.
                  </p>
                </div>
              )}
            </div>
          </Splitter.Panel>

          {/* Center: Editor */}
          <Splitter.Panel min={320}>
            <CollaborativeEditor yText={yText} awareness={awareness} readOnly={isObserver} />
          </Splitter.Panel>

          {/* Right: Participants + (Stats OR History OR Chat+TestResults) */}
          <Splitter.Panel defaultSize={288} min={200} max={420}>
            <div className="h-full bg-white flex flex-col overflow-hidden">
              <ParticipantList />
              {statsVisible ? (
                <SessionStatsPanel />
              ) : historyVisible ? (
                <SubmissionHistoryPanel onRevert={handleRevertSubmission} />
              ) : (
                <Splitter orientation="vertical" style={{ height: "100%" }}>
                  <Splitter.Panel size="50%" min={100}>
                    <ChatPanel onSend={handleSendMessage} readOnly={isObserver} />
                  </Splitter.Panel>
                  <Splitter.Panel size="50%" min={80}>
                    <TestResultsPanel submission={lastSubmission} isLoading={isRunning} />
                  </Splitter.Panel>
                </Splitter>
              )}
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
}

// ── Page entry point — params are unwrapped here, workspace is in Suspense ───
interface Props {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: Props) {
  const { roomId } = use(params);
  return (
    <Suspense>
      <RoomWorkspace roomId={roomId} />
    </Suspense>
  );
}
