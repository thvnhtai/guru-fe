"use client";

import DOMPurify from "dompurify";
import { useState } from "react";
import type { Problem } from "@/types/problem";

const DIFFICULTY_STYLES = {
  Easy: "bg-green-50 text-green-700 border border-green-200",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  Hard: "bg-red-50 text-red-700 border border-red-200",
} as const;

interface Props {
  problem: Problem;
}

export function ProblemStatement({ problem }: Props) {
  const [hintsOpen, setHintsOpen] = useState(false);

  const sanitized = DOMPurify.sanitize(problem.question);

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <h2 className="text-base font-bold text-gray-900 flex-1 leading-snug">
          {problem.questionFrontendId}. {problem.questionTitle}
        </h2>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${DIFFICULTY_STYLES[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
      </div>

      {/* Topic tags */}
      <div className="flex flex-wrap gap-1.5">
        {problem.topicTags.map((tag) => (
          <span
            key={tag.slug}
            className="text-[11px] bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full"
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Problem description */}
      <div
        className="prose prose-sm max-w-none text-gray-700
          prose-p:leading-relaxed
          prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />

      {/* Hints */}
      {problem.hints.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setHintsOpen((o) => !o)}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
            aria-expanded={hintsOpen}
          >
            {hintsOpen ? "Hide hints" : `Show hints (${problem.hints.length})`}
          </button>
          {hintsOpen && (
            <ol className="mt-2 space-y-1.5 list-decimal list-inside text-xs text-gray-600 leading-relaxed">
              {problem.hints.map((hint, i) => (
                <li key={i}>{hint}</li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
