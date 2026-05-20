import type {
  Problem,
  ProblemsResponse,
  FetchProblemsParams,
} from "@/types/problem";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiError(0, `Network error fetching ${url}`);
  }

  if (!response.ok) {
    throw new ApiError(response.status, `API error ${response.status}: ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchProblems(
  params: FetchProblemsParams
): Promise<ProblemsResponse> {
  const query = new URLSearchParams();
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.skip !== undefined) query.set("skip", String(params.skip));
  if (params.difficulty) query.set("difficulty", params.difficulty);
  if (params.tags?.length) query.set("tags", params.tags.join("+"));

  const qs = query.toString();
  return apiFetch<ProblemsResponse>(`/api/problems${qs ? `?${qs}` : ""}`);
}

export async function fetchProblem(titleSlug: string): Promise<Problem> {
  return apiFetch<Problem>(`/api/problems/${titleSlug}`);
}

export async function fetchDailyChallenge(): Promise<Problem> {
  return apiFetch<Problem>("/api/daily");
}

export interface CodeRunRequest {
  titleSlug: string;
  code: string;
  language: string;
}

export interface CodeRunResponse {
  success: boolean;
  testResults?: Array<{
    passed: boolean;
    output?: string;
    expected: string;
    error?: string;
  }>;
  error?: string;
}

export async function runCode(req: CodeRunRequest): Promise<CodeRunResponse> {
  try {
    const response = await fetch("/api/code/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Code run failed: ${response.status}`);
    }

    return response.json() as Promise<CodeRunResponse>;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, `Code run error: ${err}`);
  }
}
