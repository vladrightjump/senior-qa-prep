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
        <h2 className="modal-title">Welcome to QA Interview Prep ✨</h2>
        <p className="modal-lead">
          A study tool with ~150 senior QA questions across 8 categories — model answers,
          diagrams, and your own notes. Everything is local: nothing is sent to a server.
        </p>

        <div className="modal-grid">
          <section>
            <h3>🪐 Knowledge Galaxy</h3>
            <p>
              Open the <strong>Galaxy</strong> tab to see all categories as a 3D map.
              Drag to rotate, scroll to zoom, click an orb to dive into a category.
              Orb size reflects question count; the green ring shows progress.
            </p>
          </section>
          <section>
            <h3>📚 Per-category study</h3>
            <p>
              Search inside a category, filter by difficulty, and expand any question
              for a full answer. Some questions ship with Mermaid diagrams and images.
            </p>
          </section>
          <section>
            <h3>✅ Track what you know</h3>
            <p>
              Tick <strong>✓</strong> to mark a question as reviewed — the orb in the
              header fills up. Tap <strong>?</strong> to flag for later; the{" "}
              <em>Needs investigation</em> view collects them.
            </p>
          </section>
          <section>
            <h3>💬 Personal notes</h3>
            <p>
              Click the 💬 button on any question to add notes. They sync via
              Supabase if configured, otherwise stay local.
            </p>
          </section>
        </div>

        <div className="modal-shortcuts">
          <h3>Keyboard shortcuts</h3>
          <div className="kbd-grid">
            <div><kbd>/</kbd> search</div>
            <div><kbd>1</kbd>–<kbd>8</kbd> jump to category</div>
            <div><kbd>j</kbd> / <kbd>k</kbd> next / prev</div>
            <div><kbd>Space</kbd> expand question</div>
            <div><kbd>r</kbd> mark reviewed</div>
            <div><kbd>f</kbd> flag to investigate</div>
            <div><kbd>g</kbd> open galaxy</div>
            <div><kbd>?</kbd> open this help</div>
            <div><kbd>Esc</kbd> close / unfocus</div>
          </div>
        </div>

        <button className="modal-cta" onClick={onClose}>
          Got it — let's study
        </button>
      </div>
    </div>
  );
}
