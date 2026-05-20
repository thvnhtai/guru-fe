import type { Problem, ProblemSummary, ProblemsResponse } from "@/types/problem";

export const mockTopicTags = [
  { name: "Array", id: "1", slug: "array" },
  { name: "Hash Table", id: "2", slug: "hash-table" },
];

export const mockProblem: Problem = {
  questionId: "1",
  questionFrontendId: "1",
  questionTitle: "Two Sum",
  titleSlug: "two-sum",
  difficulty: "Easy",
  isPaidOnly: false,
  question:
    "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>",
  exampleTestcases: "[2,7,11,15]\n9",
  topicTags: mockTopicTags,
  hints: ["A really brute force way would be to search for all possible pairs."],
  likes: 68873,
  dislikes: 2574,
  similarQuestions: [],
};

export const mockProblemSummary: ProblemSummary = {
  questionFrontendId: "1",
  title: "Two Sum",
  titleSlug: "two-sum",
  difficulty: "Easy",
  isPaidOnly: false,
  acRate: 53.5,
  topicTags: mockTopicTags,
  hasSolution: true,
  hasVideoSolution: false,
  isFavor: false,
  freqBar: null,
  status: null,
};

export const mockHardProblemSummary: ProblemSummary = {
  questionFrontendId: "42",
  title: "Trapping Rain Water",
  titleSlug: "trapping-rain-water",
  difficulty: "Hard",
  isPaidOnly: false,
  acRate: 61.2,
  topicTags: [{ name: "Array", id: "1", slug: "array" }],
  hasSolution: true,
  hasVideoSolution: true,
  isFavor: false,
  freqBar: null,
  status: null,
};

export const mockProblemsResponse: ProblemsResponse = {
  totalQuestions: 3000,
  count: 2,
  problemsetQuestionList: [mockProblemSummary, mockHardProblemSummary],
};
