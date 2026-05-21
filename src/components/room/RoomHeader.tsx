"use client";

import { useState } from "react";
import Link from "next/link";
import { useRoomStore } from "@/stores/roomStore";
import { useUserStore } from "@/stores/userStore";
import { buildRoomUrl, generateObserverToken, generateObserverLink } from "@/lib/utils/room";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/types/room";
import { ProblemPicker } from "./ProblemPicker";

interface Props {
  /** Called when the user picks a language; caller writes to Y.Map. */
  onLanguageChange?: (lang: SupportedLanguage) => void;
  /** Called when a problem slug should be loaded into the room. */
  onLoadProblem?: (slug: string | null) => void;
  /** Called when the user wants to download the current editor content. */
  onExport?: () => void;
  /** Called when the user clicks Run Code. */
  onRunCode?: () => void;
  /** Called when the user toggles stats visibility. */
  onToggleStats?: (visible: boolean) => void;
  /** Called when the user toggles history visibility. */
  onToggleHistory?: (visible: boolean) => void;
  /** Called when the access level changes (creator only). */
  onAccessLevelChange?: (level: SupportedLanguage) => void;
  /** When true, language/problem controls are disabled and export is hidden. */
  readOnly?: boolean;
  /** When true, Run Code button shows loading state. */
  isRunning?: boolean;
  /** When true, stats panel is visible. */
  statsVisible?: boolean;
  /** When true, history panel is visible. */
  historyVisible?: boolean;
}

export function RoomHeader({ onLanguageChange, onLoadProblem, onExport, onRunCode, onToggleStats, onToggleHistory, onAccessLevelChange, readOnly = false, isRunning = false, statsVisible = false, historyVisible = false }: Props) {
  const { roomId, language, isRoomCreator, roomAccessLevel } = useRoomStore();
  const { isAuthenticated } = useUserStore();
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [accessDropdownOpen, setAccessDropdownOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(buildRoomUrl(roomId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAccessLevelChange = async (newLevel: "PUBLIC" | "INVITE" | "PRIVATE") => {
    try {
      const response = await fetch(`/api/rooms?roomId=${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accessLevel: newLevel }),
      });

      if (response.ok) {
        onAccessLevelChange?.(newLevel as SupportedLanguage);
        setAccessDropdownOpen(false);
      }
    } catch (error) {
      console.error("Failed to update access level:", error);
    }
  };

  const handleGenerateObserverLink = async () => {
    const token = generateObserverToken();
    const observerUrl = generateObserverLink(roomId, token);
    await navigator.clipboard.writeText(observerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-white shrink-0">
        {/* Left: brand + room ID + session badges */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors shrink-0"
          >
            Guru
          </Link>
          <span className="text-gray-300 shrink-0 select-none">/</span>
          <span className="text-xs text-gray-400 font-mono bg-gray-50 border border-gray-200 px-2 py-0.5 rounded truncate max-w-[180px]">
            {roomId}
          </span>

          {/* Session mode badge */}
          {isAuthenticated ? (
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 shrink-0 font-medium">
              🔐 Authenticated
            </span>
          ) : (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-300 shrink-0 font-medium">
              Anonymous
            </span>
          )}

          {/* Room ownership badge */}
          {isRoomCreator && (
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 shrink-0 font-medium">
              👤 Owner
            </span>
          )}

          {/* Access level dropdown (creator only) */}
          {isRoomCreator && (
            <div className="relative">
              <button
                onClick={() => setAccessDropdownOpen(!accessDropdownOpen)}
                className={`text-[10px] px-2 py-0.5 rounded border shrink-0 font-medium transition-colors ${
                  roomAccessLevel === "PRIVATE"
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    : roomAccessLevel === "INVITE"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
                title="Click to change room access level"
              >
                {roomAccessLevel === "PRIVATE"
                  ? "🔒 Private"
                  : roomAccessLevel === "INVITE"
                  ? "🔗 Invite"
                  : "🔓 Public"}
              </button>

              {accessDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[180px]">
                  <button
                    onClick={() => handleAccessLevelChange("PUBLIC")}
                    className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                      roomAccessLevel === "PUBLIC" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                    }`}
                  >
                    🔓 Public
                  </button>
                  <button
                    onClick={() => handleAccessLevelChange("INVITE")}
                    className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors border-t border-gray-100 ${
                      roomAccessLevel === "INVITE" ? "bg-yellow-50 text-yellow-700 font-medium" : "text-gray-700"
                    }`}
                  >
                    🔗 Invite
                  </button>
                  <button
                    onClick={() => handleAccessLevelChange("PRIVATE")}
                    className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors border-t border-gray-100 ${
                      roomAccessLevel === "PRIVATE" ? "bg-red-50 text-red-700 font-medium" : "text-gray-700"
                    }`}
                  >
                    🔒 Private
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={handleGenerateObserverLink}
                    className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    👁️ Generate observer link
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1.5">
          <select
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value as SupportedLanguage)}
            disabled={readOnly}
            className="text-xs rounded-md border border-gray-200 bg-white text-gray-700 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-gray-300 transition-colors"
            aria-label="Select programming language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{LANGUAGE_LABELS[lang]}</option>
            ))}
          </select>

          {!readOnly && (
            <button
              onClick={() => setPickerOpen(true)}
              className="text-xs rounded-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 px-3 py-1.5 transition-colors"
            >
              Load problem
            </button>
          )}

          {!readOnly && onExport && (
            <button
              onClick={onExport}
              className="text-xs rounded-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 px-3 py-1.5 transition-colors"
            >
              Export
            </button>
          )}

          {!readOnly && onRunCode && (
            <button
              onClick={onRunCode}
              disabled={isRunning}
              className="text-xs rounded-md border border-gray-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 disabled:opacity-50 px-3 py-1.5 font-medium transition-colors"
            >
              {isRunning ? "⏳ Running..." : "▶ Run Code"}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className="text-xs rounded-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 px-3 py-1.5 transition-colors"
            >
              🔗 Share
            </button>

            {shareMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[200px]">
                <button
                  onClick={async () => {
                    await copyLink();
                    setShareMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {copied ? "✓ Copy room URL" : "📋 Copy room URL"}
                </button>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(roomId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    setShareMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  {copied ? "✓ Copy room ID" : "🆔 Copy room ID"}
                </button>
                {isRoomCreator && (
                  <>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={async () => {
                        await handleGenerateObserverLink();
                        setShareMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                      title="Share read-only access link"
                    >
                      {copied ? "✓ Copy observer link" : "👁️ Copy observer link"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {onToggleStats && (
            <button
              onClick={() => onToggleStats(!statsVisible)}
              className={`text-xs rounded-md border px-3 py-1.5 transition-colors ${
                statsVisible
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                  : "border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              📊 Stats
            </button>
          )}

          {onToggleHistory && (
            <button
              onClick={() => onToggleHistory(!historyVisible)}
              className={`text-xs rounded-md border px-3 py-1.5 transition-colors ${
                historyVisible
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                  : "border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              📜 History
            </button>
          )}

          <Link
            href="/problems"
            className="text-xs rounded-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 px-3 py-1.5 transition-colors"
          >
            Problems
          </Link>
        </div>
      </header>

      {pickerOpen && (
        <ProblemPicker
          onSelect={(slug) => onLoadProblem?.(slug)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
