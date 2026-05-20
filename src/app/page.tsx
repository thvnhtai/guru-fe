"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateRoomId } from "@/lib/utils/room";
import { useUserStore } from "@/stores/userStore";
import { fetchDailyChallenge } from "@/lib/api/leetcode";
import type { Difficulty } from "@/types/problem";

interface DailySummary {
  title: string;
  titleSlug: string;
  difficulty: Difficulty;
}

const difficultyColor = (d: Difficulty) =>
  d === "Easy"
    ? "text-green-600"
    : d === "Medium"
    ? "text-yellow-600"
    : "text-red-600";

export default function HomePage() {
  const router = useRouter();
  const { name, setName, isAuthenticated, user, logout } = useUserStore();
  const [joinId, setJoinId] = useState("");
  const [tab, setTab] = useState<"create" | "join">("create");
  const [daily, setDaily] = useState<DailySummary | null>(null);

  const handleLogout = async () => {
    await logout();
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchDailyChallenge()
      .then((p) =>
        setDaily({
          title: p.questionTitle,
          titleSlug: p.titleSlug,
          difficulty: p.difficulty,
        })
      )
      .catch(() => {
        // Daily challenge unavailable — silently hide the section
      });
  }, []);

  const createRoom = async (problemSlug?: string) => {
    if (!name.trim()) return;
    const roomId = generateRoomId();

    if (isAuthenticated) {
      // Create authenticated (owned) room via API
      try {
        const response = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            roomId,
            accessLevel: "PUBLIC",
            problemSlug: problemSlug || null,
            title: `Problem: ${problemSlug || "Untitled"}`,
          }),
        });

        if (!response.ok) {
          console.error("Failed to create room");
          return;
        }

        const url = problemSlug
          ? `/room/${roomId}?problem=${encodeURIComponent(problemSlug)}`
          : `/room/${roomId}`;
        router.push(url);
      } catch (error) {
        console.error("Room creation error:", error);
      }
    } else {
      // Create anonymous (ephemeral) room
      const url = problemSlug
        ? `/room/${roomId}?problem=${encodeURIComponent(problemSlug)}`
        : `/room/${roomId}`;
      router.push(url);
    }
  };

  const handleCreate = () => createRoom();

  const handleJoin = () => {
    if (!name.trim() || !joinId.trim()) return;
    router.push(`/room/${joinId.trim()}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-black">
            Guru
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">{user?.displayName}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-md transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-md transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-xs px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black">Guru</h1>
            <p className="text-[#333333] mt-1">
              Solve LeetCode problems together, in real time
            </p>
          </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {/* Name input — always shown */}
          <div className="mb-5">
            <label
              htmlFor="display-name"
              className="block text-sm font-medium text-[#333333] mb-1"
            >
              Your display name
            </label>
            <input
              id="display-name"
              type="text"
              placeholder="e.g. Alice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={32}
            />
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg border border-gray-200 mb-5 p-1 gap-1">
            {(["create", "join"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-gray-900 text-white"
                    : "text-[#333333] hover:text-black"
                }`}
              >
                {t === "create" ? "Create room" : "Join room"}
              </button>
            ))}
          </div>

          {tab === "create" ? (
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 text-sm transition-colors"
            >
              Create new room
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Room ID (e.g. abc-def-ghi)"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleJoin}
                disabled={!name.trim() || !joinId.trim()}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2 text-sm transition-colors"
              >
                Join
              </button>
            </div>
          )}
        </div>

        {/* Daily challenge card */}
        {daily && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[#333333] mb-0.5">
                Daily challenge
              </p>
              <p className="text-sm font-medium text-black truncate">
                {daily.title}
              </p>
              <span className={`text-xs font-medium ${difficultyColor(daily.difficulty)}`}>
                {daily.difficulty}
              </span>
            </div>
            <button
              onClick={() => createRoom(daily.titleSlug)}
              disabled={!name.trim()}
              className="shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-2 transition-colors"
            >
              Solve now
            </button>
          </div>
        )}

          <p className="text-center text-sm text-[#333333] mt-4">
            or{" "}
            <Link href="/problems" className="text-blue-600 hover:underline">
              browse problems
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
