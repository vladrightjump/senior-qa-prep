// Focus session — "Focus Deck": one card at a time, reveal + Again/Soon/Got it.
// "Again" requeues the card at the end; "Got it" marks reviewed.

function FocusSession({ catId, reviewed, onMarkReviewed, onToggleFlag, flagged, onEnd }) {
  const cat = protoCatById[catId];
  // Session queue: unreviewed first, then reviewed (so there's always a session).
  const initialQueue = React.useMemo(() => {
    const un = cat.questions.filter((q) => !reviewed.has(q.id));
    const done = cat.questions.filter((q) => reviewed.has(q.id));
    return [...un, ...done].map((q) => q.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catId]);

  const [queue, setQueue] = React.useState(initialQueue);
  const [pos, setPos] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const [stats, setStats] = React.useState({ got: 0, again: 0 });

  const sessionLen = initialQueue.length;
  const finished = pos >= queue.length;
  const qId = finished ? null : queue[pos];
  const question = qId ? cat.questions.find((q) => q.id === qId) : null;

  const advance = (kind) => {
    if (!question) return;
    if (kind === "got") {
      onMarkReviewed(question.id, true);
      setStats((s) => ({ ...s, got: s.got + 1 }));
      setPos((p) => p + 1);
    } else if (kind === "soon") {
      setPos((p) => p + 1);
    } else {
      // again — requeue at the end
      setQueue((prev) => [...prev, question.id]);
      setStats((s) => ({ ...s, again: s.again + 1 }));
      setPos((p) => p + 1);
    }
    setRevealed(false);
  };

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { onEnd(); return; }
      if (finished) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEnd(); } return; }
      if (e.key === " ") { e.preventDefault(); setRevealed(true); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); advance("soon"); return; }
      if (e.key === "f") { e.preventDefault(); onToggleFlag(question.id); return; }
      if (revealed) {
        if (e.key === "1") advance("again");
        if (e.key === "2") advance("soon");
        if (e.key === "3") advance("got");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Progress segments reflect the ORIGINAL session length; requeues show as extra.
  const segs = Math.min(sessionLen, 40);
  const segOf = (i) => {
    const ratio = sessionLen ? pos / sessionLen : 1;
    const idx = i / segs;
    if (idx < ratio) return "past";
    if (i === Math.floor(ratio * segs) && !finished) return "now";
    return "";
  };

  return (
    <div className="focus" role="dialog" aria-label="Focus session">
      <div className="focus-top">
        <span className="wordmark">QA Prep</span>
        <span className="focus-sep">/</span>
        <span>Focus session · {cat.label}</span>
        <span className="spacer"></span>
        <span className="focus-count">
          {Math.min(pos + 1, queue.length)} <span className="of">of {queue.length}</span>
        </span>
        <button className="focus-end" onClick={onEnd}>End session</button>
      </div>
      <div className="focus-segs">
        {Array.from({ length: segs }).map((_, i) => (
          <span key={i} className={`focus-seg ${segOf(i)}`}></span>
        ))}
      </div>
      <div className="focus-stage">
        <div className="focus-under u1"></div>
        <div className="focus-under u2"></div>
        {finished ? (
          <div className="focus-card focus-done-card" key="done">
            <div>
              <PRing pct={stats.got / Math.max(sessionLen, 1)} size={56} />
            </div>
            <div className="focus-done-title">Session complete</div>
            <div className="focus-done-sub">{cat.label} · {queue.length} cards</div>
            <div className="focus-done-stats">
              <div className="focus-done-stat"><div className="n">{stats.got}</div><div className="l">Got it</div></div>
              <div className="focus-done-stat"><div className="n">{stats.again}</div><div className="l">Again</div></div>
            </div>
            <div className="focus-actions" style={{ maxWidth: 320, margin: "0 auto" }}>
              <button className="focus-act primary" onClick={onEnd}>Back to {cat.label}</button>
            </div>
          </div>
        ) : (
          <div className="focus-card" key={`${qId}-${pos}`}>
            <div className="focus-card-meta">
              <span className="focus-card-eyebrow">Question {String(pos + 1).padStart(2, "0")}</span>
              <span className="focus-card-dot"></span>
              <PDiff diff={question.diff} />
              <button
                className={`bookmark-btn ${flagged.has(question.id) ? "active" : ""}`}
                aria-label="Bookmark"
                onClick={() => onToggleFlag(question.id)}
              >
                <PIconBookmark size={16} filled={flagged.has(question.id)} />
              </button>
            </div>
            <div className="focus-q">{question.q}</div>
            {revealed ? (
              <>
                <div className="focus-reveal-zone">
                  <div className="focus-answer-label">Model answer</div>
                  <div className="q-answer" dangerouslySetInnerHTML={{ __html: question.answer }}></div>
                </div>
                <div className="focus-actions">
                  <button className="focus-act" onClick={() => advance("again")}>Again <span className="key">1</span></button>
                  <button className="focus-act" onClick={() => advance("soon")}>Soon <span className="key">2</span></button>
                  <button className="focus-act primary" onClick={() => advance("got")}>Got it <span className="key">3</span></button>
                </div>
              </>
            ) : (
              <button className="focus-reveal-btn" onClick={() => setRevealed(true)}>
                Reveal answer <span className="key">space</span>
              </button>
            )}
          </div>
        )}
      </div>
      <div className="focus-keys">
        <span><span className="kbd">space</span> reveal</span>
        <span><span className="kbd">1</span><span className="kbd">2</span><span className="kbd">3</span> grade</span>
        <span><span className="kbd">→</span> skip</span>
        <span><span className="kbd">f</span> bookmark</span>
        <span><span className="kbd">esc</span> end</span>
      </div>
    </div>
  );
}

window.FocusSession = FocusSession;
