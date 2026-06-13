import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { QuestionCard } from "../QuestionCard";
import type { Question } from "../../types";

// Diagram lazily imports `mermaid` (ESM, heavy) — stub it to keep tests fast.
vi.mock("../Diagram", () => ({
  Diagram: ({ source }: { source: string }) => (
    <div data-testid="diagram-stub">{source}</div>
  ),
}));

const Q: Question = {
  id: "qa-1",
  q: "What is the difference between locator() and $()?",
  diff: "mid",
  tags: ["playwright", "locators"],
  answer: "<p>locator is lazy</p>",
};

function setup(overrides: Partial<Parameters<typeof QuestionCard>[0]> = {}) {
  const callbacks = {
    onToggleOpen: vi.fn(),
    onToggleReviewed: vi.fn(),
    onToggleFlag: vi.fn(),
    onToggleComments: vi.fn(),
    onAddComment: vi.fn(),
    onDeleteComment: vi.fn(),
  };
  const props = {
    question: Q,
    num: 1,
    isReviewed: false,
    isOpen: false,
    isFocused: false,
    isFlagged: false,
    isCommentsOpen: false,
    comments: [],
    ...callbacks,
    ...overrides,
  };
  const utils = render(<QuestionCard {...props} />);
  return { ...utils, ...callbacks };
}

describe("QuestionCard", () => {
  it("shows the question text and difficulty badge", () => {
    setup();
    expect(
      screen.getByText(/difference between locator/i),
    ).toBeInTheDocument();
    expect(screen.getByText("mid")).toBeInTheDocument();
  });

  it("reflects collapsed/open state via aria-expanded on the row", () => {
    // The answer body is always in the DOM; the row collapses purely in CSS
    // (grid-template-rows), so open-ness is signalled by aria-expanded.
    const { rerender } = setup();
    const row = screen.getByRole("button", {
      name: /difference between locator/i,
    });
    expect(row).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(/locator is lazy/)).toBeInTheDocument();
    rerender(
      <QuestionCard
        question={Q}
        num={1}
        isReviewed={false}
        isOpen
        isFocused={false}
        isFlagged={false}
        isCommentsOpen={false}
        comments={[]}
        onToggleOpen={() => {}}
        onToggleReviewed={() => {}}
        onToggleFlag={() => {}}
        onToggleComments={() => {}}
        onAddComment={() => {}}
        onDeleteComment={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: /difference between locator/i }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/locator is lazy/)).toBeInTheDocument();
  });

  it("fires onToggleOpen when the row is clicked", async () => {
    const { onToggleOpen } = setup();
    await userEvent.click(
      screen.getByRole("button", { name: /difference between locator/i }),
    );
    expect(onToggleOpen).toHaveBeenCalled();
  });

  it("fires onToggleReviewed without bubbling up to toggle open", async () => {
    const { onToggleReviewed, onToggleOpen } = setup();
    await userEvent.click(
      screen.getByRole("checkbox", { name: /mark as done/i }),
    );
    expect(onToggleReviewed).toHaveBeenCalled();
    expect(onToggleOpen).not.toHaveBeenCalled();
  });

  it("fires onToggleFlag when the bookmark checkbox is clicked", async () => {
    const { onToggleFlag } = setup();
    await userEvent.click(
      screen.getByRole("checkbox", { name: /bookmark for later/i }),
    );
    expect(onToggleFlag).toHaveBeenCalled();
  });

  it("renders the comments panel when open + isCommentsOpen and submits a note", async () => {
    const { onAddComment } = setup({ isOpen: true, isCommentsOpen: true });
    const textarea = screen.getByPlaceholderText(/add a note/i);
    await userEvent.type(textarea, "remember the auto-wait nuance");
    await userEvent.click(screen.getByRole("button", { name: /add note/i }));
    expect(onAddComment).toHaveBeenCalledWith("remember the auto-wait nuance");
  });

  it("disables the submit button for empty / whitespace drafts", () => {
    setup({ isOpen: true, isCommentsOpen: true });
    expect(screen.getByRole("button", { name: /add note/i })).toBeDisabled();
  });

  it("renders the Diagram stub when a diagram source is provided and card is open", () => {
    const withDiagram: Question = { ...Q, diagram: "graph TD; A-->B" };
    render(
      <QuestionCard
        question={withDiagram}
        num={1}
        isReviewed={false}
        isOpen
        isFocused={false}
        isFlagged={false}
        isCommentsOpen={false}
        comments={[]}
        onToggleOpen={() => {}}
        onToggleReviewed={() => {}}
        onToggleFlag={() => {}}
        onToggleComments={() => {}}
        onAddComment={() => {}}
        onDeleteComment={() => {}}
      />,
    );
    expect(screen.getByTestId("diagram-stub")).toHaveTextContent("graph TD");
  });

  it("renders media when provided and the card is open", () => {
    const withMedia: Question = {
      ...Q,
      media: [{ type: "image", src: "/x.png", caption: "demo" }],
    };
    render(
      <QuestionCard
        question={withMedia}
        num={1}
        isReviewed={false}
        isOpen
        isFocused={false}
        isFlagged={false}
        isCommentsOpen={false}
        comments={[]}
        onToggleOpen={() => {}}
        onToggleReviewed={() => {}}
        onToggleFlag={() => {}}
        onToggleComments={() => {}}
        onAddComment={() => {}}
        onDeleteComment={() => {}}
      />,
    );
    expect(screen.getByText("demo")).toBeInTheDocument();
  });
});
