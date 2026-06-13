import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category } from "../types";
import { IconBookmark } from "./icons";

interface FocusSessionProps {
  category: Category;
  reviewedIds: Set<string>;
  flaggedIds: Set<string>;
  onMarkReviewed: (id: string) => void;
  onToggleFlag: (id: string) => void;
  onEnd: () => void;
}

function ProgressRing({
  pct,
  size = 56,
  stroke = 5,
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

export function FocusSession({
  category,
  reviewedIds,
  flaggedIds,
  onMarkReviewed,
  onToggleFlag,
  onEnd,
}: FocusSessionProps) {
  // Initial queue: unreviewed first, then reviewed.
  const initialQueue = useMemo(() => {
    const un: string[] = [];
    const done: string[] = [];
    for (const q of category.questions) {
      if (reviewedIds.has(q.id)) done.push(q.id);
      else un.push(q.id);
    }
    return [...un, ...done];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id]);

  const [queue, setQueue] = useState<string[]>(initialQueue);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ got: 0, again: 0 });

  const questionById = useMemo(() => {
    const m = new Map<string, Category["questions"][number]>();
    for (const q of category.questions) m.set(q.id, q);
    return m;
  }, [category]);

  const sessionLen = initialQueue.length;
  const finished = pos >= queue.length;
  const qId = finished ? null : queue[pos] ?? null;
  const question = qId ? questionById.get(qId) ?? null : null;

  const advance = useCallback(
    (kind: "got" | "soon" | "again") => {
      if (!question) return;
      if (kind === "got") {
        if (!reviewedIds.has(question.id)) onMarkReviewed(question.id);
        setStats((s) => ({ ...s, got: s.got + 1 }));
        setPos((p) => p + 1);
      } else if (kind === "soon") {
        setPos((p) => p + 1);
      } else {
        setQueue((prev) => [...prev, question.id]);
        setStats((s) => ({ ...s, again: s.again + 1 }));
        setPos((p) => p + 1);
      }
      setRevealed(false);
    },
    [question, reviewedIds, onMarkReviewed],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEnd();
        return;
      }
      if (finished) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEnd();
        }
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        setRevealed(true);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        advance("soon");
        return;
      }
      if (e.key === "f" && question) {
        e.preventDefault();
        onToggleFlag(question.id);
        return;
      }
      if (revealed) {
        if (e.key === "1") advance("again");
        if (e.key === "2") advance("soon");
        if (e.key === "3") advance("got");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, finished, onEnd, onToggleFlag, question, revealed]);

  const segs = Math.min(sessionLen, 40);
  const segClass = (i: number): string => {
    const ratio = sessionLen ? pos / sessionLen : 1;
    const fraction = segs ? i / segs : 0;
    if (fraction < ratio) return "past";
    if (!finished && i === Math.floor(ratio * segs)) return "now";
    return "";
  };

  return (
    <div className="focus" role="dialog" aria-label="Focus session">
      <div className="focus-top">
        <span className="wordmark">QA Prep</span>
        <span className="focus-sep">/</span>
        <span>Focus session · {category.label}</span>
        <span className="spacer" />
        <span className="focus-count">
          {Math.min(pos + 1, Math.max(queue.length, 1))}{" "}
          <span className="of">of {queue.length}</span>
        </span>
        <button className="focus-end" onClick={onEnd}>
          End session
        </button>
      </div>
      <div className="focus-segs" aria-hidden="true">
        {Array.from({ length: segs }).map((_, i) => (
          <span key={i} className={`focus-seg ${segClass(i)}`} />
        ))}
      </div>
      <div className="focus-stage">
        <div className="focus-under u1" aria-hidden="true" />
        <div className="focus-under u2" aria-hidden="true" />
        {finished || !question ? (
          <div className="focus-card focus-done-card" key="done">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ProgressRing
                pct={sessionLen ? stats.got / sessionLen : 0}
                size={56}
              />
            </div>
            <div className="focus-done-title">Session complete</div>
            <div className="focus-done-sub">
              {category.label} · {queue.length} cards
            </div>
            <div className="focus-done-stats">
              <div className="focus-done-stat">
                <div className="n">{stats.got}</div>
                <div className="l">Got it</div>
              </div>
              <div className="focus-done-stat">
                <div className="n">{stats.again}</div>
                <div className="l">Again</div>
              </div>
            </div>
            <div
              className="focus-actions"
              style={{ maxWidth: 320, margin: "0 auto" }}
            >
              <button className="focus-act primary" onClick={onEnd}>
                Back to {category.label}
              </button>
            </div>
          </div>
        ) : (
          <div className="focus-card" key={`${qId}-${pos}`}>
            <div className="focus-card-meta">
              <span className="focus-card-eyebrow">
                Question {String(pos + 1).padStart(2, "0")}
              </span>
              <span className="focus-card-dot" />
              <span className={`q-diff ${question.diff}`}>
                <span className="dot" aria-hidden="true" />
                {question.diff}
              </span>
              <button
                className={`bookmark-btn ${
                  flaggedIds.has(question.id) ? "active" : ""
                }`}
                aria-label={
                  flaggedIds.has(question.id)
                    ? "Remove bookmark"
                    : "Bookmark for later"
                }
                onClick={() => onToggleFlag(question.id)}
              >
                <IconBookmark size={16} filled={flaggedIds.has(question.id)} />
              </button>
            </div>
            <div className="focus-q">{question.q}</div>
            {revealed ? (
              <>
                <div className="focus-reveal-zone">
                  <div className="focus-answer-label">Model answer</div>
                  <div
                    className="q-answer"
                    dangerouslySetInnerHTML={{ __html: question.answer }}
                  />
                </div>
                <div className="focus-actions">
                  <button className="focus-act" onClick={() => advance("again")}>
                    Again <span className="key">1</span>
                  </button>
                  <button className="focus-act" onClick={() => advance("soon")}>
                    Soon <span className="key">2</span>
                  </button>
                  <button
                    className="focus-act primary"
                    onClick={() => advance("got")}
                  >
                    Got it <span className="key">3</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                className="focus-reveal-btn"
                onClick={() => setRevealed(true)}
              >
                Reveal answer <span className="key">space</span>
              </button>
            )}
          </div>
        )}
      </div>
      <div className="focus-keys">
        <span>
          <span className="kbd">space</span> reveal
        </span>
        <span>
          <span className="kbd">1</span>
          <span className="kbd">2</span>
          <span className="kbd">3</span> grade
        </span>
        <span>
          <span className="kbd">→</span> skip
        </span>
        <span>
          <span className="kbd">f</span> bookmark
        </span>
        <span>
          <span className="kbd">esc</span> end
        </span>
      </div>
    </div>
  );
}
