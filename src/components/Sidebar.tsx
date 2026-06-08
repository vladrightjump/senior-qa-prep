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
          <span className="nav-item-label">Needs investigation</span>
          <span className="nav-item-meta">
            <span>to revisit</span>
            <span>{flaggedCount} flagged</span>
          </span>
        </button>

        <div style={{ height: 22 }} />
        <div className="sidebar-section">Chapters</div>
        {categories.map((cat, i) => {
          const total = cat.questions.length;
          const reviewed = cat.questions.filter((q) => reviewedIds.has(q.id)).length;
          const pct = total ? Math.round((reviewed / total) * 100) : 0;
          // Roman numerals for that textbook-chapter feel
          const roman = toRoman(i + 1);
          return (
            <button
              key={cat.id}
              className={`nav-item ${cat.id === activeId ? "active" : ""}`}
              data-chapter={roman}
              onClick={() => {
                onSelect(cat.id);
                onCloseMobile();
              }}
            >
              <span className="nav-item-label">
                {/* Hidden plain-text "N. Label" for tests / screen readers */}
                <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                  {i + 1}. {cat.label}
                </span>
                <span aria-hidden="true">{cat.label}</span>
              </span>
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
        <div className="sidebar-section">Keys</div>
        <div className="sidebar-shortcuts">
          <kbd>/</kbd> search<br />
          <kbd>1</kbd>–<kbd>8</kbd> chapter<br />
          <kbd>j</kbd>/<kbd>k</kbd> next/prev<br />
          <kbd>Space</kbd> open card<br />
          <kbd>r</kbd> mark mastered<br />
          <kbd>f</kbd> bookmark<br />
          <kbd>g</kbd> galaxy<br />
          <kbd>?</kbd> help · <kbd>Esc</kbd>
        </div>
      </aside>
    </>
  );
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [v, s] of map) {
    while (n >= v) { out += s; n -= v; }
  }
  return out;
}
