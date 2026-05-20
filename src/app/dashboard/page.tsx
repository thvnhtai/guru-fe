"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useDashboardStats } from "@/lib/hooks/useDashboardData";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentRoomsSection } from "@/components/dashboard/RecentRoomsSection";
import { BookmarksWidget } from "@/components/dashboard/BookmarksWidget";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const stats = useDashboardStats();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold text-gray-900">
              Guru
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.displayName}</span>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-md transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName}!
          </h1>
          <p className="text-gray-600 mb-6">
            Quick access to your rooms and statistics
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/?tab=create")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create New Room
            </button>
            <Link
              href="/problems"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm font-medium rounded-lg transition-colors"
            >
              Browse Problems
            </Link>
            <Link
              href="/profile"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm font-medium rounded-lg transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Stats and Bookmarks */}
          <div className="lg:col-span-1 space-y-6">
            <StatsCard stats={stats} />
            <BookmarksWidget />
          </div>

          {/* Main: Recent Rooms */}
          <div className="lg:col-span-3">
            <RecentRoomsSection />
          </div>
        </div>
      </div>
    </main>
  );
}
