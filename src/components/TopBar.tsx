import { IconHelp } from "./icons";

interface TopBarProps {
  totalReviewed: number;
  totalQuestions: number;
  screen: "home" | "category";
  isBookmarksActive: boolean;
  bookmarksCount: number;
  onGoHome: () => void;
  onGoBrowse: () => void;
  onGoBookmarks: () => void;
  onOpenHelp: () => void;
}

export function TopBar({
  totalReviewed,
  totalQuestions,
  screen,
  isBookmarksActive,
  bookmarksCount,
  onGoHome,
  onGoBrowse,
  onGoBookmarks,
  onOpenHelp,
}: TopBarProps) {
  const pct = totalQuestions
    ? Math.round((totalReviewed / totalQuestions) * 100)
    : 0;

  const isHome = screen === "home";
  const isBrowse = screen === "category" && !isBookmarksActive;

  return (
    <header className="topbar">
      <button className="wordmark" onClick={onGoHome} aria-label="QA Prep — home">
        QA Prep
      </button>
      <span className="tagline">
        a field guide for the senior automation interview
      </span>
      <nav className="topnav" aria-label="Primary">
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
          Bookmarks<span className="count">{bookmarksCount}</span>
        </button>
      </nav>
      <span className="spacer" />
      <span
        className="topbar-progress"
        aria-label={`Overall progress: ${pct}%`}
      >
        <strong>{totalReviewed}</strong> / {totalQuestions} reviewed · {pct}%
      </span>
      <span className="topbar-bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
      <button
        className="topbar-help"
        onClick={onOpenHelp}
        title="Help (?)"
        aria-label="Open help"
      >
        <IconHelp size={18} />
      </button>
    </header>
  );
}
