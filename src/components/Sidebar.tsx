import type { Category } from "../types";

interface SidebarProps {
  categories: Category[];
  activeId: string;
  reviewedIds: Set<string>;
  onSelect: (id: string) => void;
  open: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  categories,
  activeId,
  reviewedIds,
  onSelect,
  open,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-section">Categories</div>
        {categories.map((cat, i) => {
          const total = cat.questions.length;
          const reviewed = cat.questions.filter((_, qi) =>
            reviewedIds.has(`${cat.id}::${qi}`)
          ).length;
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
          <kbd>Esc</kbd> unfocus
        </div>
      </aside>
    </>
  );
}
