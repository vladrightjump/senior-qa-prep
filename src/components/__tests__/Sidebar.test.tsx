import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Sidebar, NEEDS_INVESTIGATION_ID } from "../Sidebar";
import type { Category } from "../../types";

const CATS: Category[] = [
  {
    id: "pw",
    label: "Playwright",
    desc: "",
    questions: [
      { id: "p1", q: "?", diff: "easy", answer: "" },
      { id: "p2", q: "?", diff: "mid", answer: "" },
      { id: "p3", q: "?", diff: "hard", answer: "" },
    ],
  },
  {
    id: "sql",
    label: "SQL",
    desc: "",
    questions: [{ id: "s1", q: "?", diff: "easy", answer: "" }],
  },
];

describe("Sidebar", () => {
  it("renders every category and the Needs-investigation entry", () => {
    render(
      <Sidebar
        categories={CATS}
        activeId="pw"
        reviewedIds={new Set()}
        flaggedCount={0}
        onSelect={() => {}}
        open={false}
        onCloseMobile={() => {}}
      />,
    );
    expect(screen.getByText(/1\. Playwright/)).toBeInTheDocument();
    expect(screen.getByText(/2\. SQL/)).toBeInTheDocument();
    expect(screen.getByText(/Needs investigation/i)).toBeInTheDocument();
  });

  it("shows the reviewed / total counts per category", () => {
    render(
      <Sidebar
        categories={CATS}
        activeId="pw"
        reviewedIds={new Set(["p1", "p2"])}
        flaggedCount={3}
        onSelect={() => {}}
        open={false}
        onCloseMobile={() => {}}
      />,
    );
    expect(screen.getByText("2/3")).toBeInTheDocument();
    expect(screen.getByText("0/1")).toBeInTheDocument();
    expect(screen.getByText(/3 flagged/)).toBeInTheDocument();
  });

  it("invokes onSelect with the category id when clicked", async () => {
    const onSelect = vi.fn();
    const onCloseMobile = vi.fn();
    render(
      <Sidebar
        categories={CATS}
        activeId="pw"
        reviewedIds={new Set()}
        flaggedCount={0}
        onSelect={onSelect}
        open={false}
        onCloseMobile={onCloseMobile}
      />,
    );
    await userEvent.click(screen.getByText(/2\. SQL/));
    expect(onSelect).toHaveBeenCalledWith("sql");
    expect(onCloseMobile).toHaveBeenCalled();
  });

  it("invokes onSelect with the investigation id when clicked", async () => {
    const onSelect = vi.fn();
    render(
      <Sidebar
        categories={CATS}
        activeId="pw"
        reviewedIds={new Set()}
        flaggedCount={0}
        onSelect={onSelect}
        open={false}
        onCloseMobile={() => {}}
      />,
    );
    await userEvent.click(screen.getByText(/Needs investigation/i));
    expect(onSelect).toHaveBeenCalledWith(NEEDS_INVESTIGATION_ID);
  });
});
