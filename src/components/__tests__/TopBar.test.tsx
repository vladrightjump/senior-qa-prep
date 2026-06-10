import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TopBar } from "../TopBar";

const baseProps = {
  totalReviewed: 5,
  totalQuestions: 20,
  theme: "auto" as const,
  screen: "home" as const,
  isBookmarksActive: false,
  bookmarksCount: 3,
  onGoHome: vi.fn(),
  onGoBrowse: vi.fn(),
  onGoBookmarks: vi.fn(),
  onOpenHelp: vi.fn(),
  onCycleTheme: vi.fn(),
  onReset: vi.fn(),
  onMobileMenuToggle: vi.fn(),
};

describe("TopBar", () => {
  it("renders the reviewed/total counter with percentage", () => {
    render(<TopBar {...baseProps} />);
    expect(
      screen.getByLabelText(/overall progress: 25%/i),
    ).toBeInTheDocument();
  });

  it("computes 0% when no questions exist", () => {
    render(<TopBar {...baseProps} totalQuestions={0} totalReviewed={0} />);
    expect(
      screen.getByLabelText(/overall progress: 0%/i),
    ).toBeInTheDocument();
  });

  it("marks Home as active when screen is home", () => {
    render(<TopBar {...baseProps} screen="home" />);
    const homeBtn = screen.getByRole("button", { name: "Home" });
    expect(homeBtn).toHaveAttribute("aria-current", "page");
  });

  it("marks Browse as active when screen is category and bookmarks not active", () => {
    render(
      <TopBar {...baseProps} screen="category" isBookmarksActive={false} />,
    );
    const browseBtn = screen.getByRole("button", { name: "Browse" });
    expect(browseBtn).toHaveAttribute("aria-current", "page");
  });

  it("fires goHome on wordmark click", async () => {
    const onGoHome = vi.fn();
    render(<TopBar {...baseProps} onGoHome={onGoHome} />);
    await userEvent.click(
      screen.getByRole("button", { name: /qa prep — home/i }),
    );
    expect(onGoHome).toHaveBeenCalled();
  });

  it("invokes help, theme, and reset callbacks", async () => {
    const onOpenHelp = vi.fn();
    const onCycleTheme = vi.fn();
    const onReset = vi.fn();
    render(
      <TopBar
        {...baseProps}
        onOpenHelp={onOpenHelp}
        onCycleTheme={onCycleTheme}
        onReset={onReset}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /open help/i }));
    await userEvent.click(screen.getByRole("button", { name: /theme/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /reset progress/i }),
    );
    expect(onOpenHelp).toHaveBeenCalled();
    expect(onCycleTheme).toHaveBeenCalled();
    expect(onReset).toHaveBeenCalled();
  });
});
