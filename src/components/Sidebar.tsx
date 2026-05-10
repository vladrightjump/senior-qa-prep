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
        <div className="sidebar-section">Review</div>
        <button
          className={`nav-item nav-item-flag ${
            activeId === NEEDS_INVESTIGATION_ID ? "active" : ""
          }`}
          onClick={() => {
            onSelect(NEEDS_INVESTIGATION_ID);
            onCloseMobile();
          }}
        >
          <span>🔎 Needs investigation</span>
          <span className="nav-item-meta">
            <span>{flaggedCount} flagged</span>
          </span>
        </button>
        <div style={{ height: 18 }} />
        <div className="sidebar-section">Categories</div>
        {categories.map((cat, i) => {
          const total = cat.questions.length;
          const reviewed = cat.questions.filter((q) => reviewedIds.has(q.id)).length;
          return (
            <button
              key={cat.id}
              className={`nav-item ${cat.id === activeId ? "active" : ""}`}
              onClick={() => {
                onSelect(cat.id);
                onCloseMobile();
              }}
            >
              <span>{i + 1}. {cat.label}</span>
              <span className="nav-item-meta">
                <span>{total} questions</span>
                <span>{reviewed}/{total}</span>
              </span>
            </button>
          );
        })}
        <div style={{ height: 24 }} />
        <div className="sidebar-section">Shortcuts</div>
        <div style={{ fontSize: 12, color: "var(--fg-dim)", padding: "0 12px", lineHeight: 1.7 }}>
          <kbd>/</kbd> search<br />
          <kbd>1</kbd>–<kbd>8</kbd> jump<br />
          <kbd>j</kbd>/<kbd>k</kbd> next/prev<br />
          <kbd>Space</kbd> toggle<br />
          <kbd>r</kbd> mark reviewed<br />
          <kbd>f</kbd> flag investigate<br />
          <kbd>Esc</kbd> unfocus
        </div>
      </aside>
    </>
  );
}
