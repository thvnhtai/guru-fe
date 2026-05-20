import { type NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env["LEETCODE_API_BASE_URL"] ?? "https://alfa-leetcode-api.onrender.com";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const upstream = new URL(`${BASE_URL}/problems`);

  // Forward supported query params
  // alfa-leetcode-api expects difficulty in UPPERCASE (EASY/MEDIUM/HARD)
  ["limit", "skip", "tags"].forEach((key) => {
    const value = searchParams.get(key);
    if (value) upstream.searchParams.set(key, value);
  });
  const difficulty = searchParams.get("difficulty");
  if (difficulty) upstream.searchParams.set("difficulty", difficulty.toUpperCase());

  const response = await fetch(upstream.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
