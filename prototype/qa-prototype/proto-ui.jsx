// Shared UI bits for the QA Prep prototype: icons, progress ring, helpers.

function PIcon({ d, size = 16, sw = 1.6, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d}
    </svg>
  );
}
const PIconCheck = (p) => <PIcon {...p} d={<polyline points="4.5 12.5 9.5 17.5 19.5 6.5"></polyline>} />;
const PIconChevron = (p) => <PIcon {...p} d={<polyline points="6 9 12 15 18 9"></polyline>} />;
const PIconArrowR = (p) => <PIcon {...p} d={<g><line x1="4" y1="12" x2="20" y2="12"></line><polyline points="13 5 20 12 13 19"></polyline></g>} />;
const PIconBookmark = ({ filled, size = 16, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" style={style}>
    <path d="M6 3.5h12v17l-6-4.5-6 4.5z"></path>
  </svg>
);
const PIconZap = (p) => <PIcon {...p} d={<polygon points="13 2 4 14 11 14 10 22 20 9 13 9"></polygon>} />;
const PIconMenu = (p) => <PIcon {...p} d={<g><line x1="3.5" y1="7" x2="20.5" y2="7"></line><line x1="3.5" y1="12" x2="20.5" y2="12"></line><line x1="3.5" y1="17" x2="20.5" y2="17"></line></g>} />;
const PIconClose = (p) => <PIcon {...p} d={<g><line x1="5.5" y1="5.5" x2="18.5" y2="18.5"></line><line x1="18.5" y1="5.5" x2="5.5" y2="18.5"></line></g>} />;

function PRing({ pct, size = 44 }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--rule)" strokeWidth="4"></circle>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} style={{ transition: "stroke-dasharray 500ms cubic-bezier(.22,1,.36,1)" }}></circle>
    </svg>
  );
}

const PDiff = ({ diff }) => (
  <span className={`q-diff ${diff}`}><span className="dot"></span>{diff}</span>
);

// Mount-reveal with a guaranteed-visible fallback.
// phase 0 = hidden, 1 = animating in, 2 = settled (final state forced, no
// timeline dependency). Driven by setTimeout (fires even in a backgrounded
// tab) so content can never get stuck hidden. Replays when `key` changes.
function useReveal(key) {
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 20);
    const t2 = setTimeout(() => setPhase(2), 950);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [key]);
  return phase === 0 ? "" : phase === 1 ? "in" : "in settled";
}

// Derived helpers over PROTO_DATA
const protoCatById = Object.fromEntries(window.PROTO_DATA.CATS.map((c) => [c.id, c]));
const protoAllQuestions = window.PROTO_DATA.CATS.flatMap((c) => c.questions.map((q) => ({ ...q, catId: c.id, catLabel: c.label })));
const protoTotalCount = protoAllQuestions.length;

Object.assign(window, {
  PIconCheck, PIconChevron, PIconArrowR, PIconBookmark, PIconZap, PIconMenu, PIconClose,
  PRing, PDiff, protoCatById, protoAllQuestions, protoTotalCount, useReveal,
});
