import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../../__mocks__/server";
import {
  fetchProblem,
  fetchProblems,
  fetchDailyChallenge,
  ApiError,
} from "@/lib/api/leetcode";
import { mockProblem, mockProblemsResponse } from "../../../__mocks__/fixtures";

describe("fetchProblem", () => {
  it("returns a typed Problem for a valid titleSlug", async () => {
    const problem = await fetchProblem("two-sum");
    expect(problem.questionTitle).toBe("Two Sum");
    expect(problem.titleSlug).toBe("two-sum");
    expect(problem.difficulty).toBe("Easy");
    expect(problem.topicTags).toHaveLength(2);
  });

  it("throws ApiError with status 404 when titleSlug does not exist", async () => {
    await expect(fetchProblem("nonexistent-slug")).rejects.toThrow(ApiError);
    await expect(fetchProblem("nonexistent-slug")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("throws ApiError when fetch fails with network error", async () => {
    server.use(
      http.get("/api/problems/:titleSlug", () => {
        return HttpResponse.error();
      })
    );
    await expect(fetchProblem("two-sum")).rejects.toThrow(ApiError);
  });
});

describe("fetchProblems", () => {
  it("returns ProblemsResponse with correct shape", async () => {
    const result = await fetchProblems({});
    expect(result.totalQuestions).toBe(mockProblemsResponse.totalQuestions);
    expect(result.problemsetQuestionList).toHaveLength(2);
    expect(result.problemsetQuestionList[0]?.titleSlug).toBe("two-sum");
  });

  it("filters by difficulty when provided", async () => {
    const result = await fetchProblems({ difficulty: "Hard" });
    expect(result.problemsetQuestionList).toHaveLength(1);
    expect(result.problemsetQuestionList[0]?.difficulty).toBe("Hard");
  });

  it("passes limit and skip params in the request URL", async () => {
    let capturedUrl = "";
    server.use(
      http.get("/api/problems", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockProblemsResponse);
      })
    );
    await fetchProblems({ limit: 10, skip: 20 });
    expect(capturedUrl).toContain("limit=10");
    expect(capturedUrl).toContain("skip=20");
  });

  it("throws ApiError when the request fails", async () => {
    server.use(
      http.get("/api/problems", () => HttpResponse.error())
    );
    await expect(fetchProblems({})).rejects.toThrow(ApiError);
  });
});

describe("fetchDailyChallenge", () => {
  it("returns a Problem", async () => {
    const problem = await fetchDailyChallenge();
    expect(problem.questionId).toBe(mockProblem.questionId);
    expect(problem.difficulty).toBeDefined();
  });

  it("throws ApiError when the request fails", async () => {
    server.use(
      http.get("/api/daily", () => HttpResponse.error())
    );
    await expect(fetchDailyChallenge()).rejects.toThrow(ApiError);
  });
});
