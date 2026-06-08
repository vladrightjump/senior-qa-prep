import type { Theme } from "../types";

interface TopBarProps {
  totalReviewed: number;
  totalQuestions: number;
  theme: Theme;
  galaxyOpen: boolean;
  onToggleGalaxy: () => void;
  onOpenHelp: () => void;
  onCycleTheme: () => void;
  onReset: () => void;
  onMobileMenuToggle: () => void;
}

export function TopBar({
  totalReviewed,
  totalQuestions,
  theme,
  onOpenHelp,
  onCycleTheme,
  onReset,
  onMobileMenuToggle,
}: TopBarProps) {
  const pct = totalQuestions ? Math.round((totalReviewed / totalQuestions) * 100) : 0;
  const themeLabel = theme === "auto" ? "Auto" : theme === "light" ? "Light" : "Dark";

  return (
    <header className="topbar">
      <button
        className="icon-btn mobile-toggle"
        onClick={onMobileMenuToggle}
        aria-label="Toggle menu"
        title="Toggle menu"
      >
        ☰
      </button>
      <div className="topbar-title">
        Study <span className="dim">QA Interview Prep</span>
      </div>
      <div className="topbar-spacer" />
      <div
        className="topbar-progress"
        title={`${totalReviewed} of ${totalQuestions} completed (${pct}%)`}
        aria-label={`Overall progress: ${pct}%`}
      >
        <div className="progress-bar" aria-hidden="true">
          <div style={{ width: `${pct}%` }} />
        </div>
        <span className="topbar-progress-num">
          {totalReviewed}/{totalQuestions}
        </span>
      </div>
      <button
        className="icon-btn"
        onClick={onOpenHelp}
        title="Help (?)"
        aria-label="Open help"
      >
        ?
      </button>
      <button
        className="icon-btn"
        onClick={onCycleTheme}
        title={`Theme: ${themeLabel}. Click to cycle.`}
        aria-label={`Theme: ${themeLabel}`}
      >
        {themeLabel[0]}
      </button>
      <button
        className="icon-btn"
        onClick={onReset}
        title="Reset all progress"
        aria-label="Reset progress"
      >
        ↺
      </button>
    </header>
  );
}
