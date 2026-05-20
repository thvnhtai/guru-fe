"use client";

import type { Difficulty } from "@/types/problem";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: "border-green-300 text-green-700 bg-green-50",
  Medium: "border-yellow-300 text-yellow-700 bg-yellow-50",
  Hard: "border-red-300 text-red-700 bg-red-50",
};

export interface FilterState {
  difficulty: Difficulty | null;
  search: string;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function ProblemFilters({ filters, onChange }: Props) {
  const setDifficulty = (d: Difficulty | null) =>
    onChange({ ...filters, difficulty: d });

  const setSearch = (s: string) => onChange({ ...filters, search: s });

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <input
        type="text"
        placeholder="Search problems..."
        value={filters.search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search problems"
      />

      <div className="flex gap-2" role="group" aria-label="Filter by difficulty">
        <button
          onClick={() => setDifficulty(null)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            filters.difficulty === null
              ? "border-blue-400 bg-blue-50 text-blue-700"
              : "border-gray-200 text-[#333333] hover:bg-gray-50"
          }`}
        >
          All
        </button>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              filters.difficulty === d
                ? DIFFICULTY_STYLES[d]
                : "border-gray-200 text-[#333333] hover:bg-gray-50"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
