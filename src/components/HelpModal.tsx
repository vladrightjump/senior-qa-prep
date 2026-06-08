import { useEffect } from "react";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close help"
          title="Close (Esc)"
        >
          ✕
        </button>
        <h2 className="modal-title">Welcome to QA Interview Prep</h2>
        <p className="modal-lead">
          A focused set of senior automation questions organized by topic. Read, mark
          what you know, save what you want to revisit. Everything is stored locally.
        </p>

        <div className="modal-grid">
          <section>
            <h3>Browse by topic</h3>
            <p>
              Pick a topic from the sidebar, filter by difficulty, and search within
              it. Open any question to see the full answer with diagrams and code.
            </p>
          </section>
          <section>
            <h3>Track your progress</h3>
            <p>
              Tap the checkbox to mark a question as completed. Tap the star to save it
              for later — saved items show up under "Saved for later".
            </p>
          </section>
          <section>
            <h3>Add your own notes</h3>
            <p>
              Open the Notes panel on any question to add personal notes — mnemonics,
              follow-ups, or anything else you want to remember.
            </p>
          </section>
          <section>
            <h3>Works offline</h3>
            <p>
              All progress is saved in your browser. Optionally sign in to sync your
              progress and notes across devices.
            </p>
          </section>
        </div>

        <div className="modal-shortcuts">
          <h3>Keyboard shortcuts</h3>
          <div className="kbd-grid">
            <div><kbd>/</kbd> search</div>
            <div><kbd>1</kbd>–<kbd>8</kbd> jump to topic</div>
            <div><kbd>j</kbd> / <kbd>k</kbd> next / previous</div>
            <div><kbd>Space</kbd> open a card</div>
            <div><kbd>r</kbd> mark completed</div>
            <div><kbd>f</kbd> bookmark</div>
            <div><kbd>?</kbd> open this help</div>
            <div><kbd>Esc</kbd> close / unfocus</div>
          </div>
        </div>

        <button className="modal-cta" onClick={onClose}>
          Get started
        </button>
      </div>
    </div>
  );
}
