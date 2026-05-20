import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProblemStatement } from "@/components/problem/ProblemStatement";
import { mockProblem } from "../../../__mocks__/fixtures";

describe("ProblemStatement", () => {
  it("renders the problem title with frontend ID", () => {
    render(<ProblemStatement problem={mockProblem} />);
    expect(
      screen.getByText(/1\. Two Sum/i)
    ).toBeInTheDocument();
  });

  it("renders the difficulty badge", () => {
    render(<ProblemStatement problem={mockProblem} />);
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });

  it("applies the correct color class for Easy difficulty", () => {
    render(<ProblemStatement problem={mockProblem} />);
    const badge = screen.getByText("Easy");
    expect(badge.className).toContain("green");
  });

  it("renders topic tags", () => {
    render(<ProblemStatement problem={mockProblem} />);
    expect(screen.getByText("Array")).toBeInTheDocument();
    expect(screen.getByText("Hash Table")).toBeInTheDocument();
  });

  it("renders the problem HTML content", () => {
    render(<ProblemStatement problem={mockProblem} />);
    // The mock question contains the text "integers"
    expect(screen.getByText(/integers/i)).toBeInTheDocument();
  });

  it("does not execute injected scripts (XSS sanitization)", () => {
    const xssProblem = {
      ...mockProblem,
      question: '<script>window.__xss = true</script><p>Safe content</p>',
    };
    render(<ProblemStatement problem={xssProblem} />);
    expect((window as unknown as Record<string, unknown>)["__xss"]).toBeUndefined();
    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  it("hides hints by default", () => {
    render(<ProblemStatement problem={mockProblem} />);
    expect(screen.queryByText(/brute force/i)).not.toBeInTheDocument();
    expect(screen.getByText(/show hints/i)).toBeInTheDocument();
  });

  it("reveals hints when the show button is clicked", async () => {
    const user = userEvent.setup();
    render(<ProblemStatement problem={mockProblem} />);

    await user.click(screen.getByText(/show hints/i));

    expect(screen.getByText(/brute force/i)).toBeInTheDocument();
    expect(screen.getByText(/hide hints/i)).toBeInTheDocument();
  });
});
