import type { Theme } from "../types";

interface TopBarProps {
  totalReviewed: number;
  totalQuestions: number;
  theme: Theme;
  onCycleTheme: () => void;
  onReset: () => void;
  onMobileMenuToggle: () => void;
}

export function TopBar({
  totalReviewed,
  totalQuestions,
  theme,
  onCycleTheme,
  onReset,
  onMobileMenuToggle,
}: TopBarProps) {
  const pct = totalQuestions ? Math.round((totalReviewed / totalQuestions) * 100) : 0;
  const themeIcon = theme === "auto" ? "◐" : theme === "light" ? "☀" : "☾";

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
        QA Interview Prep <span className="dim">Senior Automation</span>
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-progress" title={`${totalReviewed} of ${totalQuestions} reviewed`}>
        <span>{totalReviewed}/{totalQuestions}</span>
        <div className="progress-bar"><div style={{ width: `${pct}%` }} /></div>
      </div>
      <button
        className="icon-btn"
        onClick={onCycleTheme}
        title={`Theme: ${theme}. Click to cycle.`}
        aria-label={`Theme: ${theme}`}
      >
        {themeIcon}
      </button>
      <button
        className="icon-btn"
        onClick={onReset}
        title="Reset all progress"
        aria-label="Reset progress"
      >
        ⟳
      </button>
    </header>
  );
}
