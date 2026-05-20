"use client";

import { useEffect, useState } from "react";
import { fetchProblem } from "./leetcode";
import type { Problem } from "@/types/problem";

export function useProblem(titleSlug: string | null) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!titleSlug) {
      setProblem(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProblem(titleSlug)
      .then((p) => {
        if (!cancelled) setProblem(p);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load problem");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [titleSlug]);

  return { problem, loading, error };
}
