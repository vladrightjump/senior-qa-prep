import { useMemo } from "react";
import type { Category, CategoryGroup } from "../types";
import { IconArrowRight } from "./icons";

interface HomeScreenProps {
  categories: Category[];
  groups: CategoryGroup[];
  reviewedIds: Set<string>;
  lastCategoryId: string;
  onOpenCategory: (id: string) => void;
  onResume: (id: string) => void;
}

function ProgressRing({
  pct,
  size = 44,
  stroke = 4,
}: {
  pct: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  const dash = c * clamped;
  return (
    <svg
      className="p-ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--rule)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

export function HomeScreen({
  categories,
  groups,
  reviewedIds,
  lastCategoryId,
  onOpenCategory,
  onResume,
}: HomeScreenProps) {
  const categoriesById = useMemo(() => {
    const m = new Map<string, Category>();
    for (const c of categories) m.set(c.id, c);
    return m;
  }, [categories]);

  const totalQuestions = useMemo(
    () => categories.reduce((s, c) => s + c.questions.length, 0),
    [categories],
  );
  const totalDone = useMemo(
    () =>
      categories.reduce(
        (s, c) =>
          s + c.questions.filter((q) => reviewedIds.has(q.id)).length,
        0,
      ),
    [categories, reviewedIds],
  );
  const remaining = Math.max(totalQuestions - totalDone, 0);
  const pct = totalQuestions
    ? Math.round((totalDone / totalQuestions) * 100)
    : 0;

  const lastCat =
    categoriesById.get(lastCategoryId) ?? categories[0]!;
  const lastDone = lastCat.questions.filter((q) =>
    reviewedIds.has(q.id),
  ).length;
  const lastTotal = lastCat.questions.length;
  const nextQ = lastCat.questions.find((q) => !reviewedIds.has(q.id));

  const now = new Date();
  const greeting = greetingFor(now.getHours());
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  let cardIdx = 0;

  return (
    <main className="home">
      <div className="home-head">
        <div>
          <div className="home-date">{dateStr}</div>
          <h1 className="home-title">
            {greeting}
            <br />
            <em>{remaining} questions to go.</em>
          </h1>
          <div className="home-stat">
            <ProgressRing pct={totalQuestions ? totalDone / totalQuestions : 0} />
            <div>
              <div className="home-stat-line1">
                {totalDone} of {totalQuestions} reviewed
              </div>
              <div className="home-stat-line2">
                {pct}% of the full question bank
              </div>
            </div>
          </div>
        </div>
        <div className="continue-card">
          <div className="continue-eyebrow">Continue where you left off</div>
          <div className="continue-title">{lastCat.label}</div>
          <div className="continue-next">
            {nextQ
              ? <>Next up · &ldquo;{nextQ.q}&rdquo;</>
              : "All reviewed — take a victory lap or start a focus session."}
          </div>
          <div className="continue-row">
            <button
              className="continue-btn"
              onClick={() => onResume(lastCat.id)}
            >
              Resume <IconArrowRight size={14} strokeWidth={2} />
            </button>
            <span className="continue-track" aria-hidden="true">
              <span
                style={{
                  width: `${lastTotal ? (lastDone / lastTotal) * 100 : 0}%`,
                }}
              />
            </span>
            <span className="continue-count">
              {lastDone}/{lastTotal}
            </span>
          </div>
        </div>
      </div>

      {groups.map((group) => {
        const cats = group.categoryIds
          .map((id) => categoriesById.get(id))
          .filter((c): c is Category => Boolean(c));
        const gDone = cats.reduce(
          (s, c) =>
            s + c.questions.filter((q) => reviewedIds.has(q.id)).length,
          0,
        );
        const gTotal = cats.reduce((s, c) => s + c.questions.length, 0);
        return (
          <section key={group.id} className="home-group">
            <div className="home-group-head">
              <span className="home-group-label">{group.label}</span>
              <span className="home-group-line" />
              <span className="home-group-count">
                {gDone}/{gTotal}
              </span>
            </div>
            <div className="home-grid">
              {cats.map((cat) => {
                cardIdx += 1;
                const total = cat.questions.length;
                const done = cat.questions.filter((q) =>
                  reviewedIds.has(q.id),
                ).length;
                const isFull = total > 0 && done === total;
                const widthPct = total ? (done / total) * 100 : 0;
                return (
                  <button
                    key={cat.id}
                    className="cat-card"
                    onClick={() => onOpenCategory(cat.id)}
                  >
                    <span className="cat-card-top">
                      <span className="cat-card-num">
                        {String(cardIdx).padStart(2, "0")}
                      </span>
                      {isFull ? (
                        <span className="cat-card-done">COMPLETE</span>
                      ) : (
                        <span className="cat-card-count">
                          {done}
                          <span className="of">/{total}</span>
                        </span>
                      )}
                    </span>
                    <span className="cat-card-label">{cat.label}</span>
                    <span className="cat-card-bar" aria-hidden="true">
                      <span
                        className={isFull ? "full" : ""}
                        style={{ width: `${widthPct}%` }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
