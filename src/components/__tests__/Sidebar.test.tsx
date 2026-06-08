import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Sidebar, NEEDS_INVESTIGATION_ID } from "../Sidebar";
import type { Category, CategoryGroup } from "../../types";

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

const GROUPS: CategoryGroup[] = [
  { id: "tools", label: "Tools", categoryIds: ["pw", "sql"] },
];

beforeEach(() => {
  localStorage.clear();
});

describe("Sidebar", () => {
  it("renders the group header and the Saved-for-later entry", () => {
    render(
      <Sidebar
        categories={CATS}
        groups={GROUPS}
        activeId="pw"
        reviewedIds={new Set()}
        flaggedCount={0}
        onSelect={() => {}}
        open={false}
        onCloseMobile={() => {}}
      />,
    );
    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByText("Playwright")).toBeInTheDocument();
    expect(screen.getByText("SQL")).toBeInTheDocument();
    expect(screen.getByText(/Saved for later/i)).toBeInTheDocument();
  });

  it("shows the reviewed / total counts per category", () => {
    render(
      <Sidebar
        categories={CATS}
        groups={GROUPS}
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
    // Group header shows aggregate "2/4" (2 reviewed of 4 total)
    expect(screen.getByText("2/4")).toBeInTheDocument();
  });

  it("invokes onSelect with the category id when clicked", async () => {
    const onSelect = vi.fn();
    const onCloseMobile = vi.fn();
    render(
      <Sidebar
        categories={CATS}
        groups={GROUPS}
        activeId="pw"
        reviewedIds={new Set()}
        flaggedCount={0}
        onSelect={onSelect}
        open={false}
        onCloseMobile={onCloseMobile}
      />,
    );
    await userEvent.click(screen.getByText("SQL"));
    expect(onSelect).toHaveBeenCalledWith("sql");
    expect(onCloseMobile).toHaveBeenCalled();
  });

  it("invokes onSelect with the investigation id when Saved-for-later is clicked", async () => {
    const onSelect = vi.fn();
    render(
      <Sidebar
        categories={CATS}
        groups={GROUPS}
        activeId="pw"
        reviewedIds={new Set()}
        flaggedCount={0}
        onSelect={onSelect}
        open={false}
        onCloseMobile={() => {}}
      />,
    );
    await userEvent.click(screen.getByText(/Saved for later/i));
    expect(onSelect).toHaveBeenCalledWith(NEEDS_INVESTIGATION_ID);
  });
});
