import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES } from "./data/questions";
import type { DiffFilter, Theme } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { QuestionCard } from "./components/QuestionCard";

const STORAGE_KEY = "qa-prep-state-v1";

interface PersistedState {
  activeCategoryId: string;
  reviewedIds: Set<string>;
  openIds: Set<string>;
  theme: Theme;
}

const defaultState: PersistedState = {
  activeCategoryId: CATEGORIES[0]!.id,
  reviewedIds: new Set<string>(),
  openIds: new Set<string>(),
  theme: "auto",
};

export default function App() {
  const [state, setState] = useLocalStorage<PersistedState>(STORAGE_KEY, defaultState);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<DiffFilter>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState<number>(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const focusedCardRef = useRef<HTMLDivElement>(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  // Active category
  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === state.activeCategoryId) ?? CATEGORIES[0]!,
    [state.activeCategoryId]
  );

  // Filtered list of questions in the active category
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return activeCategory.questions
      .map((q, idx) => ({ q, idx, id: `${activeCategory.id}::${idx}` }))
      .filter(({ q }) => {
        if (diffFilter !== "all" && q.diff !== diffFilter) return false;
        if (!term) return true;
        const haystack = `${q.q} ${(q.tags ?? []).join(" ")} ${q.answer}`.toLowerCase();
        return haystack.includes(term);
      });
  }, [activeCategory, search, diffFilter]);

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
  const totalReviewed = state.reviewedIds.size;

  /* ----- Handlers ----- */
  const cycleTheme = () => {
    setState((p) => {
      const next: Theme = p.theme === "auto" ? "light" : p.theme === "light" ? "dark" : "auto";
      return { ...p, theme: next };
    });
  };

  const reset = () => {
    if (confirm("Reset all progress? This clears your reviewed questions and open cards.")) {
      setState({ ...defaultState, theme: state.theme });
    }
  };

  const setActiveCategory = (id: string) => {
    setState((p) => ({ ...p, activeCategoryId: id }));
    setSearch("");
    setDiffFilter("all");
  };

  const toggleOpen = (id: string) => {
    setState((p) => {
      const next = new Set(p.openIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...p, openIds: next };
    });
  };

  const toggleReviewed = (id: string) => {
    setState((p) => {
      const next = new Set(p.reviewedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...p, reviewedIds: next };
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
        if (item) toggleOpen(item.id);
        return;
      }
      if (e.key === "r" && focusedIdx >= 0) {
        e.preventDefault();
        const item = filtered[focusedIdx];
        if (item) toggleReviewed(item.id);
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, focusedIdx]);

  return (
    <>
      <TopBar
        totalReviewed={totalReviewed}
        totalQuestions={totalQuestions}
        theme={state.theme}
        onCycleTheme={cycleTheme}
        onReset={reset}
        onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
      />
      <div className="layout">
        <Sidebar
          categories={CATEGORIES}
          activeId={state.activeCategoryId}
          reviewedIds={state.reviewedIds}
          onSelect={setActiveCategory}
          open={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <main className="main">
          <div className="cat-header">
            <h1>{activeCategory.label}</h1>
            <p>{activeCategory.desc}</p>
          </div>
          <div className="controls">
            <input
              ref={searchRef}
              type="text"
              className="search"
              placeholder="Search this category…   (press /)"
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
              No questions match. Try clearing search or changing difficulty.
            </div>
          ) : (
            <div className="q-list">
              {filtered.map((item, i) => {
                const isFocused = i === focusedIdx;
                return (
                  <div ref={isFocused ? focusedCardRef : null} key={item.id}>
                    <QuestionCard
                      question={item.q}
                      num={item.idx + 1}
                      isReviewed={state.reviewedIds.has(item.id)}
                      isOpen={state.openIds.has(item.id)}
                      isFocused={isFocused}
                      onToggleOpen={() => toggleOpen(item.id)}
                      onToggleReviewed={() => toggleReviewed(item.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
