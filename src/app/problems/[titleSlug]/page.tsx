import { notFound } from "next/navigation";
import { ProblemStatement } from "@/components/problem/ProblemStatement";
import { DiscussionPanel } from "@/components/discussion/DiscussionPanel";
import Link from "next/link";

interface Props {
  params: Promise<{ titleSlug: string }>;
}

async function getProblem(titleSlug: string) {
  const baseUrl =
    process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/problems/${titleSlug}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function ProblemDetailPage({ params }: Props) {
  const { titleSlug } = await params;
  const problem = await getProblem(titleSlug);

  if (!problem) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Link
        href="/problems"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to problems
      </Link>
      <ProblemStatement problem={problem} />
      <DiscussionPanel problemSlug={problem.titleSlug} />
    </div>
  );
}
