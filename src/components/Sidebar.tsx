import { useEffect, useMemo } from "react";
import type { Category, CategoryGroup } from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { IconChevronDown, IconBookmark, IconClose } from "./icons";

export const NEEDS_INVESTIGATION_ID = "__needs_investigation__";

interface SidebarProps {
  categories: Category[];
  groups: CategoryGroup[];
  activeId: string;
  reviewedIds: Set<string>;
  flaggedCount: number;
  onSelect: (id: string) => void;
  open: boolean;
  onCloseMobile: () => void;
}

const EXPANDED_KEY = "qa-prep-sidebar-groups-v1";

export function Sidebar({
  categories,
  groups,
  activeId,
  reviewedIds,
  flaggedCount,
  onSelect,
  open,
  onCloseMobile,
}: SidebarProps) {
  const categoriesById = useMemo(() => {
    const m = new Map<string, Category>();
    for (const c of categories) m.set(c.id, c);
    return m;
  }, [categories]);

  const groupOfCategory = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of groups) for (const cid of g.categoryIds) m.set(cid, g.id);
    return m;
  }, [groups]);

  // Persist expanded group ids
  const [expanded, setExpanded] = useLocalStorage<Set<string>>(
    EXPANDED_KEY,
    new Set<string>([groupOfCategory.get(activeId) ?? groups[0]?.id ?? ""]),
  );

  // When user navigates to a category in a collapsed group, expand it
  useEffect(() => {
    const gid = groupOfCategory.get(activeId);
    if (!gid) return;
    if (expanded.has(gid)) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(gid);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const toggleGroup = (gid: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(gid)) next.delete(gid);
      else next.add(gid);
      return next;
    });
  };

  const select = (id: string) => {
    onSelect(id);
    onCloseMobile();
  };

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-mobilehead">
        <span className="sidebar-mobilehead-title">Contents</span>
        <button
          className="sidebar-close"
          onClick={onCloseMobile}
          aria-label="Close contents"
        >
          <IconClose size={18} />
        </button>
      </div>

      <button
        className={`toc-bookmarks ${activeId === NEEDS_INVESTIGATION_ID ? "active" : ""}`}
        onClick={() => select(NEEDS_INVESTIGATION_ID)}
      >
        <IconBookmark size={14} filled={activeId === NEEDS_INVESTIGATION_ID} />
        <span>Saved for later</span>
        <span className="count">{flaggedCount}</span>
      </button>

      <div className="sidebar-label">Contents</div>

      {groups.map((group) => {
        const isOpen = expanded.has(group.id);
        const groupCategories = group.categoryIds
          .map((id) => categoriesById.get(id))
          .filter((c): c is Category => Boolean(c));
        const groupTotal = groupCategories.reduce(
          (s, c) => s + c.questions.length,
          0,
        );
        const groupReviewed = groupCategories.reduce(
          (s, c) =>
            s + c.questions.filter((q) => reviewedIds.has(q.id)).length,
          0,
        );

        return (
          <div key={group.id} className="toc-group">
            <button
              className="toc-group-head"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
            >
              <span className="toc-group-label">{group.label}</span>
              <span className="toc-group-count">
                {groupReviewed}/{groupTotal}
              </span>
              <span className={`toc-chev ${isOpen ? "" : "closed"}`} aria-hidden="true">
                <IconChevronDown size={12} />
              </span>
            </button>
            <div className={`toc-body ${isOpen ? "" : "closed"}`}>
              <div>
                {groupCategories.map((cat) => {
                  const total = cat.questions.length;
                  const reviewed = cat.questions.filter((q) =>
                    reviewedIds.has(q.id),
                  ).length;
                  const isComplete = total > 0 && reviewed === total;
                  return (
                    <button
                      key={cat.id}
                      className={`toc-item ${cat.id === activeId ? "active" : ""}`}
                      onClick={() => select(cat.id)}
                    >
                      <span className="toc-item-label">{cat.label}</span>
                      <span className="toc-leader" aria-hidden="true" />
                      <span className="toc-item-count">
                        {isComplete ? "✓" : `${reviewed}/${total}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
