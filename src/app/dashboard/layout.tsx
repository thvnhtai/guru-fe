"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoadingAuth } = useUserStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setAuthChecked(true);
  }, [isAuthenticated, isLoadingAuth, router]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
