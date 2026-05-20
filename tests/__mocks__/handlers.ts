import { http, HttpResponse } from "msw";
import {
  mockProblem,
  mockProblemsResponse,
} from "./fixtures";

// These handlers intercept calls to our Next.js API proxy routes (not the external API)
export const handlers = [
  http.get("/api/problems", ({ request }) => {
    const url = new URL(request.url);
    const difficulty = url.searchParams.get("difficulty");

    if (difficulty === "Hard") {
      return HttpResponse.json({
        ...mockProblemsResponse,
        problemsetQuestionList:
          mockProblemsResponse.problemsetQuestionList.filter(
            (p) => p.difficulty === "Hard"
          ),
        count: 1,
      });
    }

    return HttpResponse.json(mockProblemsResponse);
  }),

  http.get("/api/problems/:titleSlug", ({ params }) => {
    if (params["titleSlug"] === "two-sum") {
      return HttpResponse.json(mockProblem);
    }
    return HttpResponse.json(
      { error: "Problem not found" },
      { status: 404 }
    );
  }),

  http.get("/api/daily", () => {
    return HttpResponse.json(mockProblem);
  }),
];
