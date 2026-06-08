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
        <h2 className="modal-title">
          Welcome to <em>QA Interview Prep</em>
        </h2>
        <p className="modal-lead">
          A guided study journal of senior automation questions, set across chapters
          you can open at any time. Read, annotate, bookmark, and return — at your own
          pace. Everything you mark stays with you locally.
        </p>

        <div className="modal-grid">
          <section>
            <h3>Chapters, one journal</h3>
            <p>
              Each chapter opens like a textbook section. Pick a difficulty, search
              within, and unfold any prompt to read the worked answer with diagrams.
            </p>
          </section>
          <section>
            <h3>Track what you've mastered</h3>
            <p>
              Tap the ✓ to mark a prompt as <em>mastered</em>. Tap the <em>?</em> to
              bookmark anything that needs another pass — they collect in the{" "}
              <em>Needs investigation</em> view.
            </p>
          </section>
          <section>
            <h3>Knowledge Galaxy</h3>
            <p>
              Need a bird's-eye view? Open the Galaxy to see every chapter as a
              constellation. Orb size reflects question count; the warm ring tracks
              your progress.
            </p>
          </section>
          <section>
            <h3>Personal marginalia</h3>
            <p>
              Click ✎ on any prompt to leave a note in the margin — your own
              shorthand, mnemonic, or follow-up question. Notes sync across devices
              when signed in.
            </p>
          </section>
        </div>

        <div className="modal-shortcuts">
          <h3>Keyboard shortcuts</h3>
          <div className="kbd-grid">
            <div><kbd>/</kbd> search within chapter</div>
            <div><kbd>1</kbd>–<kbd>8</kbd> jump to chapter</div>
            <div><kbd>j</kbd> / <kbd>k</kbd> next / previous card</div>
            <div><kbd>Space</kbd> open a card</div>
            <div><kbd>r</kbd> mark mastered</div>
            <div><kbd>f</kbd> bookmark for later</div>
            <div><kbd>g</kbd> open the galaxy</div>
            <div><kbd>?</kbd> reopen this guide</div>
            <div><kbd>Esc</kbd> close / unfocus</div>
          </div>
        </div>

        <button className="modal-cta" onClick={onClose}>
          Begin — let's study
        </button>
      </div>
    </div>
  );
}
