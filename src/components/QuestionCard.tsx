import type { Question } from "../types";

interface QuestionCardProps {
  question: Question;
  num: number;
  isReviewed: boolean;
  isOpen: boolean;
  isFocused: boolean;
  onToggleOpen: () => void;
  onToggleReviewed: () => void;
}

export function QuestionCard({
  question,
  num,
  isReviewed,
  isOpen,
  isFocused,
  onToggleOpen,
  onToggleReviewed,
}: QuestionCardProps) {
  return (
    <div
      className={`q-card ${isReviewed ? "reviewed" : ""} ${isOpen ? "open" : ""} ${
        isFocused ? "focused" : ""
      }`}
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
          <span className={`badge badge-${question.diff}`}>{question.diff}</span>
          {question.tags?.slice(0, 2).map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </span>
        <span className="q-chevron">›</span>
      </button>
      {isOpen && (
        <div className="q-detail" dangerouslySetInnerHTML={{ __html: question.answer }} />
      )}
    </div>
  );
}
