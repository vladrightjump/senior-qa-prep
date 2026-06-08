import type { Category } from "../types";

export const NEEDS_INVESTIGATION_ID = "__needs_investigation__";

interface SidebarProps {
  categories: Category[];
  activeId: string;
  reviewedIds: Set<string>;
  flaggedCount: number;
  onSelect: (id: string) => void;
  open: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  categories,
  activeId,
  reviewedIds,
  flaggedCount,
  onSelect,
  open,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-section">Bookmarks</div>
        <button
          className={`nav-item nav-item-flag ${
            activeId === NEEDS_INVESTIGATION_ID ? "active" : ""
          }`}
          onClick={() => {
            onSelect(NEEDS_INVESTIGATION_ID);
            onCloseMobile();
          }}
        >
          <span className="nav-item-label">Saved for later</span>
          <span className="nav-item-meta">
            <span>flagged questions</span>
            <span>{flaggedCount}</span>
          </span>
        </button>

        <div style={{ height: 22 }} />
        <div className="sidebar-section">Topics</div>
        {categories.map((cat) => {
          const total = cat.questions.length;
          const reviewed = cat.questions.filter((q) => reviewedIds.has(q.id)).length;
          const pct = total ? Math.round((reviewed / total) * 100) : 0;
          return (
            <button
              key={cat.id}
              className={`nav-item ${cat.id === activeId ? "active" : ""}`}
              onClick={() => {
                onSelect(cat.id);
                onCloseMobile();
              }}
            >
              <span className="nav-item-label">{cat.label}</span>
              <span className="nav-item-meta">
                <span>{total} questions</span>
                <span>{reviewed}/{total}</span>
              </span>
              <span className="nav-item-progress" aria-hidden="true">
                <i style={{ width: `${pct}%` }} />
              </span>
            </button>
          );
        })}

        <div style={{ height: 28 }} />
        <div className="sidebar-section">Shortcuts</div>
        <div className="sidebar-shortcuts">
          <kbd>/</kbd> search<br />
          <kbd>1</kbd>–<kbd>8</kbd> topic<br />
          <kbd>j</kbd>/<kbd>k</kbd> next/prev<br />
          <kbd>Space</kbd> open<br />
          <kbd>r</kbd> mark done<br />
          <kbd>f</kbd> bookmark<br />
          <kbd>?</kbd> help · <kbd>Esc</kbd>
        </div>
      </aside>
    </>
  );
}
