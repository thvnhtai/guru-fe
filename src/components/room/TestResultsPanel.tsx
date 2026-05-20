"use client";

import { useState } from "react";
import type { SubmissionResult } from "@/types/room";

interface Props {
  submission: SubmissionResult | null;
  isLoading?: boolean;
}

export function TestResultsPanel({ submission, isLoading = false }: Props) {
  const [expanded, setExpanded] = useState(true);

  if (!submission && !isLoading) return null;

  return (
    <div className="flex flex-col h-full border-t border-gray-100 overflow-hidden bg-white">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 pt-3 pb-2 hover:bg-gray-50 transition-colors"
      >
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Test Results
        </span>
        <span className="text-xs text-gray-400 ml-auto">
          {expanded ? "▾" : "▸"}
        </span>
      </button>

      {expanded && (
        <div className="flex-1 overflow-y-auto px-3 pb-2">
          {isLoading ? (
            <div className="space-y-2 py-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          ) : submission ? (
            <div className="space-y-3 py-2">
              {/* Status line */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    submission.status === "success"
                      ? submission.passedTests === submission.totalTests
                        ? "text-green-600"
                        : "text-orange-600"
                      : submission.status === "error"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {submission.status === "success"
                    ? submission.passedTests === submission.totalTests
                      ? "✓ All tests passed"
                      : `✓ ${submission.passedTests}/${submission.totalTests} passed`
                    : submission.status === "error"
                    ? "✗ Error"
                    : "⏳ Running"}
                </span>
              </div>

              {/* Stats */}
              {submission.status === "success" && (
                <div className="text-xs text-gray-500 space-y-1">
                  {submission.totalTests && (
                    <div>Tests: {submission.passedTests}/{submission.totalTests}</div>
                  )}
                  {submission.executionTime && (
                    <div>Time: {submission.executionTime}ms</div>
                  )}
                  {submission.totalMemory && (
                    <div>Memory: {submission.totalMemory}MB</div>
                  )}
                </div>
              )}

              {/* Test results */}
              {submission.testResults.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {submission.testResults.map((result, i) => (
                    <div
                      key={i}
                      className={`text-xs p-2 rounded-md ${
                        result.passed
                          ? "bg-green-50 border border-green-100 text-green-700"
                          : "bg-red-50 border border-red-100 text-red-700"
                      }`}
                    >
                      <div className="font-medium mb-1">
                        {result.passed ? "✓" : "✗"} Test case {i + 1}
                      </div>
                      {result.error && (
                        <div className="font-mono text-[10px] mb-1 opacity-75">
                          Error: {result.error}
                        </div>
                      )}
                      {result.output !== undefined && !result.passed && (
                        <div className="font-mono text-[10px] space-y-0.5">
                          <div>Expected: {result.expected}</div>
                          <div>Got: {result.output}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-4">No test results yet</p>
          )}
        </div>
      )}
    </div>
  );
}
