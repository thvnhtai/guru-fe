import { type NextRequest, NextResponse } from "next/server";
import type { CodeRunResponse } from "@/lib/api/leetcode";

const BASE_URL = process.env["LEETCODE_API_BASE_URL"] ?? "https://alfa-leetcode-api.onrender.com";

/**
 * POST /api/code/run
 * Runs code against test cases via the external LeetCode API.
 *
 * Request body:
 * { titleSlug: string, code: string, language: string }
 *
 * Response:
 * { success: boolean, testResults?: [...], error?: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse<CodeRunResponse>> {
  try {
    const body = await request.json() as { titleSlug: string; code: string; language: string };
    const { titleSlug, code, language } = body;

    if (!titleSlug || !code || !language) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: titleSlug, code, language" },
        { status: 400 }
      );
    }

    // Call external API to run code
    const response = await fetch(`${BASE_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleSlug,
        code,
        lang: language,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `API error ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json() as {
      success?: boolean;
      testResults?: Array<{
        passed: boolean;
        output?: string;
        expected: string;
        error?: string;
      }>;
      error?: string;
    };

    return NextResponse.json({
      success: data.success ?? false,
      testResults: data.testResults,
      error: data.error,
    });
  } catch (error) {
    console.error("Code run error:", error);
    return NextResponse.json(
      { success: false, error: `Server error: ${error instanceof Error ? error.message : "unknown"}` },
      { status: 500 }
    );
  }
}
