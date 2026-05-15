import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TopBar } from "../TopBar";

// The 3D ProgressOrb renders a <Canvas> via @react-three/fiber; in jsdom
// WebGL isn't available. We stub it out so TopBar can be unit-tested in
// isolation without firing up r3f.
vi.mock("../three/ProgressOrb", () => ({
  ProgressOrb: ({ ariaLabel }: { ariaLabel?: string }) => (
    <div data-testid="progress-orb-stub" aria-label={ariaLabel} />
  ),
}));

// UserMenu reaches into AuthContext (Supabase) which isn't available in this
// unit-test scope. Replace with a minimal stub that mirrors the API.
vi.mock("../../auth/UserMenu", () => ({
  UserMenu: ({ onSignInClick }: { onSignInClick: () => void }) => (
    <button onClick={onSignInClick}>stub-sign-in</button>
  ),
}));

const baseProps = {
  totalReviewed: 5,
  totalQuestions: 20,
  theme: "auto" as const,
  galaxyOpen: false,
  onToggleGalaxy: vi.fn(),
  onOpenHelp: vi.fn(),
  onOpenSignIn: vi.fn(),
  onCycleTheme: vi.fn(),
  onReset: vi.fn(),
  onMobileMenuToggle: vi.fn(),
};

describe("TopBar", () => {
  it("renders the reviewed/total counter and progress orb", () => {
    render(<TopBar {...baseProps} />);
    expect(screen.getByText("5/20")).toBeInTheDocument();
    expect(screen.getByTestId("progress-orb-stub")).toHaveAttribute(
      "aria-label",
      "Overall progress: 25%",
    );
  });

  it("computes 0% when no questions exist", () => {
    render(<TopBar {...baseProps} totalQuestions={0} totalReviewed={0} />);
    expect(screen.getByTestId("progress-orb-stub")).toHaveAttribute(
      "aria-label",
      "Overall progress: 0%",
    );
  });

  it("invokes onToggleGalaxy when the galaxy pill is clicked", async () => {
    const onToggleGalaxy = vi.fn();
    render(<TopBar {...baseProps} onToggleGalaxy={onToggleGalaxy} />);
    await userEvent.click(screen.getByRole("button", { name: /galaxy/i }));
    expect(onToggleGalaxy).toHaveBeenCalled();
  });

  it("marks the galaxy pill as pressed when galaxyOpen is true", () => {
    render(<TopBar {...baseProps} galaxyOpen />);
    expect(
      screen.getByRole("button", { name: /galaxy/i }),
    ).toHaveAttribute("aria-pressed", "true");
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
