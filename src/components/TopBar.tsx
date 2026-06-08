import type { Theme } from "../types";
import {
  IconMenu,
  IconHelp,
  IconSun,
  IconMoon,
  IconMonitor,
  IconRefresh,
} from "./icons";

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
  const ThemeIcon = theme === "auto" ? IconMonitor : theme === "light" ? IconSun : IconMoon;

  return (
    <header className="topbar">
      <button
        className="icon-btn mobile-toggle"
        onClick={onMobileMenuToggle}
        aria-label="Toggle menu"
        title="Toggle menu"
      >
        <IconMenu size={18} />
      </button>
      <div className="topbar-title">Study</div>
      <div className="topbar-spacer" />
      <div
        className="topbar-progress"
        title={`${totalReviewed} of ${totalQuestions} completed (${pct}%)`}
        aria-label={`Overall progress: ${pct}%`}
      >
        <span className="topbar-progress-num">
          {totalReviewed} / {totalQuestions}
        </span>
        <span className="topbar-progress-pct">{pct}%</span>
      </div>
      <button
        className="icon-btn"
        onClick={onOpenHelp}
        title="Help (?)"
        aria-label="Open help"
      >
        <IconHelp size={18} />
      </button>
      <button
        className="icon-btn"
        onClick={onCycleTheme}
        title={`Theme: ${themeLabel}. Click to cycle.`}
        aria-label={`Theme: ${themeLabel}`}
      >
        <ThemeIcon size={18} />
      </button>
      <button
        className="icon-btn"
        onClick={onReset}
        title="Reset all progress"
        aria-label="Reset progress"
      >
        <IconRefresh size={16} />
      </button>
    </header>
  );
}
