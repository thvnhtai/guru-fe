import { NextResponse } from "next/server";

const BASE_URL = process.env["LEETCODE_API_BASE_URL"] ?? "https://alfa-leetcode-api.onrender.com";

export async function GET() {
  const response = await fetch(`${BASE_URL}/daily`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch daily challenge" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
