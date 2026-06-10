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
  screen: "home" | "category";
  isBookmarksActive: boolean;
  bookmarksCount: number;
  onGoHome: () => void;
  onGoBrowse: () => void;
  onGoBookmarks: () => void;
  onOpenHelp: () => void;
  onCycleTheme: () => void;
  onReset: () => void;
  onMobileMenuToggle: () => void;
}

export function TopBar({
  totalReviewed,
  totalQuestions,
  theme,
  screen,
  isBookmarksActive,
  bookmarksCount,
  onGoHome,
  onGoBrowse,
  onGoBookmarks,
  onOpenHelp,
  onCycleTheme,
  onReset,
  onMobileMenuToggle,
}: TopBarProps) {
  const pct = totalQuestions ? Math.round((totalReviewed / totalQuestions) * 100) : 0;
  const themeLabel = theme === "auto" ? "Auto" : theme === "light" ? "Light" : "Dark";
  const ThemeIcon = theme === "auto" ? IconMonitor : theme === "light" ? IconSun : IconMoon;

  const isHome = screen === "home";
  const isBrowse = screen === "category" && !isBookmarksActive;

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
      <button
        className="topbar-title"
        onClick={onGoHome}
        title="Home"
        aria-label="QA Prep — home"
      >
        QA Prep
      </button>
      <nav className="topbar-nav" aria-label="Primary">
        <button
          className={isHome ? "active" : ""}
          onClick={onGoHome}
          aria-current={isHome ? "page" : undefined}
        >
          Home
        </button>
        <button
          className={isBrowse ? "active" : ""}
          onClick={onGoBrowse}
          aria-current={isBrowse ? "page" : undefined}
        >
          Browse
        </button>
        <button
          className={isBookmarksActive ? "active" : ""}
          onClick={onGoBookmarks}
          aria-current={isBookmarksActive ? "page" : undefined}
        >
          Bookmarks<span className="count">({bookmarksCount})</span>
        </button>
      </nav>
      <div className="topbar-spacer" />
      <div
        className="topbar-progress"
        title={`${totalReviewed} of ${totalQuestions} reviewed (${pct}%)`}
        aria-label={`Overall progress: ${pct}%`}
      >
        <span>
          <span className="topbar-progress-num">{totalReviewed}</span>
          {" / "}
          {totalQuestions} reviewed · {pct}%
        </span>
        <span className="topbar-progress-bar" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </span>
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
