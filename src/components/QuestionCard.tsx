import { useState } from "react";
import type { Question, QuestionComment } from "../types";

interface QuestionCardProps {
  question: Question;
  num: number;
  isReviewed: boolean;
  isOpen: boolean;
  isFocused: boolean;
  isFlagged: boolean;
  comments: QuestionComment[];
  onToggleOpen: () => void;
  onToggleReviewed: () => void;
  onToggleFlag: () => void;
  onAddComment: (body: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatRelative(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return RELATIVE.format(diffSec, "second");
  if (abs < 3600) return RELATIVE.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return RELATIVE.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2592000) return RELATIVE.format(Math.round(diffSec / 86400), "day");
  return new Date(iso).toLocaleDateString();
}

export function QuestionCard({
  question,
  num,
  isReviewed,
  isOpen,
  isFocused,
  isFlagged,
  comments,
  onToggleOpen,
  onToggleReviewed,
  onToggleFlag,
  onAddComment,
  onDeleteComment,
}: QuestionCardProps) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    if (!draft.trim()) return;
    onAddComment(draft);
    setDraft("");
  };

  return (
    <div
      className={`q-card ${isReviewed ? "reviewed" : ""} ${isOpen ? "open" : ""} ${
        isFocused ? "focused" : ""
      } ${isFlagged ? "flagged" : ""}`}
    >
      <button className="q-row" onClick={onToggleOpen} aria-expanded={isOpen}>
        <span
          className={`q-checkbox ${isReviewed ? "checked" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleReviewed();
          }}
          role="checkbox"
          aria-checked={isReviewed}
          tabIndex={-1}
        >
          {isReviewed && "✓"}
        </span>
        <span className="q-num">#{num}</span>
        <span className="q-text">{question.q}</span>
        <span className="q-meta">
          {comments.length > 0 && (
            <span className="comment-count" title={`${comments.length} note${comments.length === 1 ? "" : "s"}`}>
              💬 {comments.length}
            </span>
          )}
          <span
            className={`q-flag-btn ${isFlagged ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFlag();
            }}
            role="button"
            aria-label={isFlagged ? "Remove investigation flag" : "Mark for investigation"}
            aria-pressed={isFlagged}
            tabIndex={-1}
            title={isFlagged ? "Flagged for investigation" : "Mark for investigation"}
          >
            🔎
          </span>
          <span className={`badge badge-${question.diff}`}>{question.diff}</span>
          {question.tags?.slice(0, 2).map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </span>
        <span className="q-chevron">›</span>
      </button>
      {isOpen && (
        <>
          <div className="q-detail" dangerouslySetInnerHTML={{ __html: question.answer }} />
          <div className="q-comments">
            <div className="q-comments-title">Notes</div>
            {comments.length === 0 ? (
              <div className="q-comments-empty">No notes yet. Add anything you want to remember about this question.</div>
            ) : (
              <ul className="q-comment-list">
                {comments.map((c) => (
                  <li key={c.id} className="q-comment">
                    <div className="q-comment-body">{c.body}</div>
                    <div className="q-comment-foot">
                      <span className="q-comment-time">{formatRelative(c.created_at)}</span>
                      <button
                        className="q-comment-del"
                        onClick={() => onDeleteComment(c.id)}
                        aria-label="Delete note"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="q-comment-input">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Add a note… (⌘/Ctrl+Enter to save)"
                rows={2}
              />
              <button
                className="q-comment-submit"
                onClick={submit}
                disabled={!draft.trim()}
              >
                Add note
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
