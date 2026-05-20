import { NextResponse } from "next/server";

const BASE_URL = process.env["LEETCODE_API_BASE_URL"] ?? "https://alfa-leetcode-api.onrender.com";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ titleSlug: string }> }
) {
  const { titleSlug } = await params;
  const upstream = `${BASE_URL}/select?titleSlug=${encodeURIComponent(titleSlug)}`;

  const response = await fetch(upstream, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Problem not found" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
