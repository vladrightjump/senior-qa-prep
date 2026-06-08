import type { Theme } from "../types";
import { ProgressOrb } from "./three/ProgressOrb";

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
  galaxyOpen,
  onToggleGalaxy,
  onOpenHelp,
  onCycleTheme,
  onReset,
  onMobileMenuToggle,
}: TopBarProps) {
  const pct = totalQuestions ? Math.round((totalReviewed / totalQuestions) * 100) : 0;
  const progress = totalQuestions ? totalReviewed / totalQuestions : 0;
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
        Atelier Études <span className="dim">A study journal</span>
      </div>
      <div className="topbar-spacer" />
      <button
        className={`pill-btn ${galaxyOpen ? "active" : ""}`}
        onClick={onToggleGalaxy}
        title="Toggle Knowledge Galaxy (g)"
        aria-pressed={galaxyOpen}
        aria-label="Toggle Galaxy"
      >
        ✦ <span className="pill-btn-label">Galaxy</span>
      </button>
      <div
        className="topbar-progress"
        title={`${totalReviewed} of ${totalQuestions} mastered (${pct}%)`}
      >
        <ProgressOrb
          progress={progress}
          size={38}
          ariaLabel={`Overall progress: ${pct}%`}
        />
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
