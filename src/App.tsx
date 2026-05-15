import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES } from "./data/questions";
import type { DiffFilter, Question, Theme } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useQuestionMeta } from "./hooks/useQuestionMeta";
import { TopBar } from "./components/TopBar";
import { Sidebar, NEEDS_INVESTIGATION_ID } from "./components/Sidebar";
import { QuestionCard } from "./components/QuestionCard";
import { HelpModal } from "./components/HelpModal";

const KnowledgeGalaxy = lazy(() =>
  import("./components/three/KnowledgeGalaxy").then((m) => ({
    default: m.KnowledgeGalaxy,
  })),
);

const STORAGE_KEY = "qa-prep-state-v3";
const HELP_SEEN_KEY = "qa-prep-help-seen-v1";

interface PersistedState {
  activeCategoryId: string;
  openIds: Set<string>;
  commentsOpenIds: Set<string>;
  theme: Theme;
}

const defaultState: PersistedState = {
  activeCategoryId: CATEGORIES[0]!.id,
  openIds: new Set<string>(),
  commentsOpenIds: new Set<string>(),
  theme: "auto",
};

interface DisplayItem {
  q: Question;
  idx: number;
  categoryLabel: string;
}

export default function App() {
  const [state, setState] = useLocalStorage<PersistedState>(STORAGE_KEY, defaultState);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<DiffFilter>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState<number>(-1);
  const [galaxyOpen, setGalaxyOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const focusedCardRef = useRef<HTMLDivElement>(null);

  const meta = useQuestionMeta();

  // First-time onboarding: open help modal once
  useEffect(() => {
    try {
      if (!localStorage.getItem(HELP_SEEN_KEY)) {
        setHelpOpen(true);
        localStorage.setItem(HELP_SEEN_KEY, "1");
      }
    } catch {
      /* localStorage unavailable — silently skip */
    }
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  const isInvestigationView = state.activeCategoryId === NEEDS_INVESTIGATION_ID;

  // Active category (or null in investigation view)
  const activeCategory = useMemo(() => {
    if (isInvestigationView) return null;
    return CATEGORIES.find((c) => c.id === state.activeCategoryId) ?? CATEGORIES[0]!;
  }, [state.activeCategoryId, isInvestigationView]);

  // Filtered list — handles both regular categories and the virtual "Needs investigation" view
  const filtered: DisplayItem[] = useMemo(() => {
    const term = search.trim().toLowerCase();

    const source: DisplayItem[] = isInvestigationView
      ? CATEGORIES.flatMap((c) =>
          c.questions
            .map((q, idx): DisplayItem => ({ q, idx, categoryLabel: c.label }))
            .filter(({ q }) => meta.flags.has(q.id)),
        )
      : (activeCategory?.questions ?? []).map((q, idx) => ({
          q,
          idx,
          categoryLabel: activeCategory!.label,
        }));

    return source.filter(({ q }) => {
      if (diffFilter !== "all" && q.diff !== diffFilter) return false;
      if (!term) return true;
      const haystack = `${q.q} ${(q.tags ?? []).join(" ")} ${q.answer}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [activeCategory, search, diffFilter, isInvestigationView, meta.flags]);

  // Reset focused card when filters change or category switches
  useEffect(() => {
    setFocusedIdx(-1);
  }, [search, diffFilter, state.activeCategoryId]);

  // Scroll focused card into view
  useEffect(() => {
    if (focusedIdx >= 0 && focusedCardRef.current) {
      focusedCardRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedIdx]);

  // Totals
  const totalQuestions = useMemo(
    () => CATEGORIES.reduce((s, c) => s + c.questions.length, 0),
    []
  );
  const totalReviewed = meta.reviewed.size;

  /* ----- Handlers ----- */
  const cycleTheme = () => {
    setState((p) => {
      const next: Theme = p.theme === "auto" ? "light" : p.theme === "light" ? "dark" : "auto";
      return { ...p, theme: next };
    });
  };

  const reset = () => {
    if (
      confirm(
        "Reset local UI state (open cards, theme)? This won't touch your reviewed/flagged questions or notes in the database.",
      )
    ) {
      setState({ ...defaultState, theme: state.theme });
    }
  };

  const setActiveCategory = (id: string) => {
    setState((p) => ({ ...p, activeCategoryId: id }));
    setSearch("");
    setDiffFilter("all");
    setGalaxyOpen(false);
  };

  const toggleOpen = (id: string) => {
    setState((p) => {
      const next = new Set(p.openIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...p, openIds: next };
    });
  };

  const toggleComments = (id: string) => {
    setState((p) => {
      const next = new Set(p.commentsOpenIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...p, commentsOpenIds: next };
    });
  };

  /* ----- Keyboard shortcuts ----- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "Escape") {
        if (inField) (target as HTMLInputElement).blur();
        setMobileMenuOpen(false);
        return;
      }

      if (inField) return;

      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      if (e.key === "g") {
        e.preventDefault();
        setGalaxyOpen((v) => !v);
        return;
      }

      // 1–8 jump to category
      if (/^[1-8]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (CATEGORIES[idx]) setActiveCategory(CATEGORIES[idx].id);
        return;
      }

      if (filtered.length === 0) return;

      if (e.key === "j") {
        e.preventDefault();
        setFocusedIdx((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === "k") {
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === " " && focusedIdx >= 0) {
        e.preventDefault();
        const item = filtered[focusedIdx];
        if (item) toggleOpen(item.q.id);
        return;
      }
      if (e.key === "r" && focusedIdx >= 0) {
        e.preventDefault();
        const item = filtered[focusedIdx];
        if (item) meta.toggleReviewed(item.q.id);
        return;
      }
      if (e.key === "f" && focusedIdx >= 0) {
        e.preventDefault();
        const item = filtered[focusedIdx];
        if (item) meta.toggleFlag(item.q.id);
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, focusedIdx]);

  const headerTitle = isInvestigationView ? "🔎 Needs investigation" : activeCategory!.label;
  const headerDesc = isInvestigationView
    ? "Questions you've flagged to revisit. Toggle the magnifier on a card to remove it from this list."
    : activeCategory!.desc;

  return (
    <>
      <TopBar
        totalReviewed={totalReviewed}
        totalQuestions={totalQuestions}
        theme={state.theme}
        galaxyOpen={galaxyOpen}
        onToggleGalaxy={() => setGalaxyOpen((v) => !v)}
        onOpenHelp={() => setHelpOpen(true)}
        onCycleTheme={cycleTheme}
        onReset={reset}
        onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
      />
      <div className="layout">
        <Sidebar
          categories={CATEGORIES}
          activeId={state.activeCategoryId}
          reviewedIds={meta.reviewed}
          flaggedCount={meta.flags.size}
          onSelect={setActiveCategory}
          open={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <main className="main">
          {galaxyOpen ? (
            <div className="galaxy-view">
              <div className="cat-header">
                <h1>🪐 Knowledge Galaxy</h1>
                <p>
                  All {CATEGORIES.length} categories at a glance. Orb size = number
                  of questions, green ring = your progress, gold dot = flagged items.
                  Click an orb to dive in.
                </p>
              </div>
              <Suspense fallback={<div className="galaxy-loading">Loading galaxy…</div>}>
                <KnowledgeGalaxy
                  categories={CATEGORIES}
                  reviewedIds={meta.reviewed}
                  flaggedIds={meta.flags}
                  onSelect={setActiveCategory}
                />
              </Suspense>
            </div>
          ) : (
            <>
              <div className="cat-header">
                <h1>{headerTitle}</h1>
                <p>{headerDesc}</p>
              </div>
              {meta.error && (
                <div className="meta-error">
                  Sync issue: {meta.error}. Changes may not be saved.
                </div>
              )}
              <div className="controls">
                <input
                  ref={searchRef}
                  type="text"
                  className="search"
                  placeholder={
                    isInvestigationView
                      ? "Search flagged questions…   (press /)"
                      : "Search this category…   (press /)"
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="pills" role="tablist" aria-label="Difficulty filter">
                  {(["all", "easy", "mid", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      className={`pill ${diffFilter === d ? "active" : ""}`}
                      onClick={() => setDiffFilter(d)}
                      role="tab"
                      aria-selected={diffFilter === d}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.length === 0 ? (
                <div className="empty">
                  {isInvestigationView
                    ? "Nothing flagged yet. Click 🔎 on any question to add it here."
                    : "No questions match. Try clearing search or changing difficulty."}
                </div>
              ) : (
                <div className="q-list">
                  {filtered.map((item, i) => {
                    const isFocused = i === focusedIdx;
                    const qid = item.q.id;
                    return (
                      <div ref={isFocused ? focusedCardRef : null} key={qid}>
                        {isInvestigationView && (
                          <div className="q-card-source">{item.categoryLabel}</div>
                        )}
                        <QuestionCard
                          question={item.q}
                          num={item.idx + 1}
                          isReviewed={meta.reviewed.has(qid)}
                          isOpen={state.openIds.has(qid)}
                          isFocused={isFocused}
                          isFlagged={meta.flags.has(qid)}
                          isCommentsOpen={state.commentsOpenIds.has(qid)}
                          comments={meta.commentsByQuestion.get(qid) ?? []}
                          onToggleOpen={() => toggleOpen(qid)}
                          onToggleReviewed={() => meta.toggleReviewed(qid)}
                          onToggleFlag={() => meta.toggleFlag(qid)}
                          onToggleComments={() => toggleComments(qid)}
                          onAddComment={(body) => meta.addComment(qid, body)}
                          onDeleteComment={(cid) => meta.deleteComment(cid)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
