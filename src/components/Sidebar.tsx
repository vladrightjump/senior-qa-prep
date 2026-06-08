import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Category, CategoryGroup } from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { IconChevronDown, IconBookmark } from "./icons";

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

const SMOOTH_EASE = [0.22, 1, 0.36, 1] as const;
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

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <button
          className={`nav-item nav-item-flag ${
            activeId === NEEDS_INVESTIGATION_ID ? "active" : ""
          }`}
          onClick={() => {
            onSelect(NEEDS_INVESTIGATION_ID);
            onCloseMobile();
          }}
        >
          <span className="nav-item-icon" aria-hidden="true">
            <IconBookmark size={14} filled={activeId === NEEDS_INVESTIGATION_ID} />
          </span>
          <span className="nav-item-label">Saved for later</span>
          <span className="nav-item-count">{flaggedCount}</span>
        </button>

        <div className="sidebar-divider" />

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
          const hasActive = group.categoryIds.includes(activeId);

          return (
            <div key={group.id} className="sidebar-group">
              <button
                className={`sidebar-group-header ${hasActive ? "has-active" : ""}`}
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isOpen}
              >
                <motion.span
                  className="sidebar-group-chevron"
                  animate={{ rotate: isOpen ? 0 : -90 }}
                  transition={{ duration: 0.18, ease: SMOOTH_EASE }}
                  aria-hidden="true"
                >
                  <IconChevronDown size={12} />
                </motion.span>
                <span className="sidebar-group-label">{group.label}</span>
                <span className="sidebar-group-count">
                  {groupReviewed}/{groupTotal}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="group-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.24, ease: SMOOTH_EASE },
                      opacity: { duration: 0.16, ease: "easeOut" },
                    }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="sidebar-group-body">
                      {groupCategories.map((cat) => {
                        const total = cat.questions.length;
                        const reviewed = cat.questions.filter((q) =>
                          reviewedIds.has(q.id),
                        ).length;
                        const pct = total
                          ? Math.round((reviewed / total) * 100)
                          : 0;
                        return (
                          <button
                            key={cat.id}
                            className={`nav-item nav-sub ${
                              cat.id === activeId ? "active" : ""
                            }`}
                            onClick={() => {
                              onSelect(cat.id);
                              onCloseMobile();
                            }}
                          >
                            <span className="nav-item-label">{cat.label}</span>
                            <span className="nav-item-meta">
                              <span>{reviewed}/{total}</span>
                            </span>
                            <span
                              className="nav-item-progress"
                              aria-hidden="true"
                            >
                              <i style={{ width: `${pct}%` }} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <div className="sidebar-divider" />
        <div className="sidebar-section">Shortcuts</div>
        <div className="sidebar-shortcuts">
          <kbd>/</kbd> search<br />
          <kbd>1</kbd>–<kbd>5</kbd> section<br />
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
