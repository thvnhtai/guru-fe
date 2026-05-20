export interface TopicTag {
  name: string;
  id: string;
  slug: string;
}

export interface SimilarQuestion {
  title: string;
  titleSlug: string;
  difficulty: Difficulty;
  translatedTitle: string | null;
}

export type Difficulty = "Easy" | "Medium" | "Hard";

/** Full problem detail from /select?titleSlug= */
export interface Problem {
  questionId: string;
  questionFrontendId: string;
  questionTitle: string;
  titleSlug: string;
  difficulty: Difficulty;
  isPaidOnly: boolean;
  question: string; // Raw HTML
  exampleTestcases: string;
  topicTags: TopicTag[];
  hints: string[];
  likes: number;
  dislikes: number;
  similarQuestions: SimilarQuestion[];
}

/** Summary item from /problems list */
export interface ProblemSummary {
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  difficulty: Difficulty;
  isPaidOnly: boolean;
  acRate: number;
  topicTags: TopicTag[];
  hasSolution: boolean;
  hasVideoSolution: boolean;
  isFavor: boolean;
  freqBar: number | null;
  status: string | null;
}

export interface ProblemsResponse {
  totalQuestions: number;
  count: number;
  problemsetQuestionList: ProblemSummary[];
}

export interface FetchProblemsParams {
  limit?: number;
  skip?: number;
  difficulty?: Difficulty;
  tags?: string[];
}
