import { useEffect, useState } from "react";
import type { Question, QuestionComment } from "../types";
import { Diagram } from "./Diagram";
import { MediaBlock } from "./MediaBlock";
import { IconCheck, IconBookmark, IconChevronDown } from "./icons";

const COLLAPSE_LINGER_MS = 240;

interface QuestionCardProps {
  question: Question;
  num: number;
  isReviewed: boolean;
  isOpen: boolean;
  isFocused: boolean;
  isFlagged: boolean;
  isCommentsOpen: boolean;
  comments: QuestionComment[];
  onToggleOpen: () => void;
  onToggleReviewed: () => void;
  onToggleFlag: () => void;
  onToggleComments: () => void;
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
  isCommentsOpen,
  comments,
  onToggleOpen,
  onToggleReviewed,
  onToggleFlag,
  onToggleComments,
  onAddComment,
  onDeleteComment,
}: QuestionCardProps) {
  const [draft, setDraft] = useState("");
  const [contentMounted, setContentMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setContentMounted(true);
      return;
    }
    const t = setTimeout(() => setContentMounted(false), COLLAPSE_LINGER_MS);
    return () => clearTimeout(t);
  }, [isOpen]);

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
          className={`q-check ${isReviewed ? "checked" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleReviewed();
          }}
          role="checkbox"
          aria-checked={isReviewed}
          aria-label={isReviewed ? "Mark as not done" : "Mark as done"}
          tabIndex={-1}
          title={isReviewed ? "Mark as not done" : "Mark as done"}
        >
          {isReviewed && <IconCheck size={14} strokeWidth={3} />}
        </span>
        <span className="q-num" aria-hidden="true">
          {String(num).padStart(2, "0")}
        </span>
        <span className="q-text">{question.q}</span>
        <span className="q-meta">
          <span className={`badge badge-${question.diff}`}>{question.diff}</span>
          <span
            className={`q-flag ${isFlagged ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFlag();
            }}
            role="checkbox"
            aria-checked={isFlagged}
            aria-label={isFlagged ? "Remove bookmark" : "Bookmark for later"}
            tabIndex={-1}
            title={isFlagged ? "Remove bookmark" : "Bookmark for later"}
          >
            <IconBookmark size={16} filled={isFlagged} />
          </span>
          <span className="q-chevron" aria-hidden="true">
            <IconChevronDown size={18} />
          </span>
        </span>
      </button>
      <div className="q-detail-wrap" aria-hidden={!isOpen}>
        <div className="q-detail">
          {contentMounted && (
            <>
              {question.diagram && <Diagram source={question.diagram} />}
              {question.media && question.media.length > 0 && (
                <MediaBlock media={question.media} />
              )}
              <div dangerouslySetInnerHTML={{ __html: question.answer }} />
              <div className="q-detail-foot">
                <button
                  className={`q-notes-btn ${isCommentsOpen ? "active" : ""} ${
                    comments.length > 0 ? "has-notes" : ""
                  }`}
                  onClick={onToggleComments}
                  aria-pressed={isCommentsOpen}
                  aria-label={isCommentsOpen ? "Hide notes" : "Show notes"}
                >
                  {comments.length === 0
                    ? "Add a note"
                    : `Notes (${comments.length})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {isCommentsOpen && (
        <div className="q-comments">
          <div className="q-comments-title">Notes</div>
          {comments.length === 0 ? (
            <div className="q-comments-empty">
              No notes yet. Add anything you want to remember about this question.
            </div>
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
      )}
    </div>
  );
}
