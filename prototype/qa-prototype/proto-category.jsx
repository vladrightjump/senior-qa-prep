// Category screen — "Reading Room": ToC sidebar + ruled question list.
// Also renders the Bookmarks view (catId === "__bookmarks__").

const BOOKMARKS_ID = "__bookmarks__";

function QuestionRow({ item, num, reviewed, flagged, open, sourceLabel, fieldNotes, note, delay, onToggleOpen, onToggleReviewed, onToggleFlag }) {
  return (
    <div className={`q-row-wrap ${open ? "open" : ""}`} style={{ "--d": `${delay || 0}ms` }}>
      {sourceLabel && <div className="q-source">{sourceLabel}</div>}
      <button className="q-row" onClick={onToggleOpen} aria-expanded={open}>
        <span
          className={`q-check ${reviewed ? "checked" : ""}`}
          role="checkbox" aria-checked={reviewed} aria-label="Mark as reviewed"
          onClick={(e) => { e.stopPropagation(); onToggleReviewed(); }}
        >
          {reviewed && <PIconCheck size={11} sw={3} />}
        </span>
        <span className="q-num">{String(num).padStart(2, "0")}</span>
        <span className={`q-text ${reviewed ? "done" : ""}`}>{item.q}</span>
        <span className="q-meta">
          {fieldNotes && note && <span className="fn-note">{note}</span>}
          {fieldNotes && reviewed && <span className="fn-stamp">REVIEWED</span>}
          <PDiff diff={item.diff} />
          <span
            className={`q-flag ${flagged ? "active" : ""}`}
            role="checkbox" aria-checked={flagged} aria-label="Bookmark"
            onClick={(e) => { e.stopPropagation(); onToggleFlag(); }}
          >
            <PIconBookmark size={15} filled={flagged} />
          </span>
          <span className={`q-chev ${open ? "open" : ""}`}><PIconChevron size={16} /></span>
        </span>
      </button>
      <div className="q-detail-wrap">
        <div>
          <div className="q-detail">
            <div className="q-answer" dangerouslySetInnerHTML={{ __html: item.answer }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TocSidebar({ activeCatId, reviewed, flaggedCount, open, onSelect, onSelectBookmarks, onClose }) {
  const { CATS, GROUPS } = window.PROTO_DATA;
  const activeGroup = (protoCatById[activeCatId] || {}).group;
  const [openGroups, setOpenGroups] = React.useState(() => new Set(GROUPS.map((g) => g.id)));

  const toggleGroup = (gid) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(gid)) next.delete(gid); else next.add(gid);
      return next;
    });
  };

  React.useEffect(() => {
    if (activeGroup) setOpenGroups((prev) => prev.has(activeGroup) ? prev : new Set([...prev, activeGroup]));
  }, [activeGroup]);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-mobilehead">
        <span className="sidebar-mobilehead-title">Contents</span>
        <button className="sidebar-close" onClick={onClose} aria-label="Close contents"><PIconClose size={18} /></button>
      </div>
      <button className={`toc-bookmarks ${activeCatId === BOOKMARKS_ID ? "active" : ""}`} onClick={onSelectBookmarks}>
        <PIconBookmark size={14} filled={activeCatId === BOOKMARKS_ID} />
        <span>Saved for later</span>
        <span className="count">{flaggedCount}</span>
      </button>
      <div className="sidebar-label">Contents</div>
      {GROUPS.map((g) => {
        const cats = CATS.filter((c) => c.group === g.id);
        const gDone = cats.reduce((s, c) => s + c.questions.filter((q) => reviewed.has(q.id)).length, 0);
        const gTotal = cats.reduce((s, c) => s + c.questions.length, 0);
        const isOpen = openGroups.has(g.id);
        return (
          <div key={g.id} className="toc-group">
            <button className="toc-group-head" onClick={() => toggleGroup(g.id)} aria-expanded={isOpen}>
              <span className="toc-numeral">{g.numeral}</span>
              <span className="toc-group-label">{g.label}</span>
              <span className="toc-group-count">{gDone}/{gTotal}</span>
              <span className={`toc-chev ${isOpen ? "" : "closed"}`}><PIconChevron size={12} /></span>
            </button>
            <div className={`toc-body ${isOpen ? "" : "closed"}`}>
              <div>
                {cats.map((cat) => {
                  const done = cat.questions.filter((q) => reviewed.has(q.id)).length;
                  const isFull = done === cat.questions.length;
                  return (
                    <button key={cat.id} className={`toc-item ${cat.id === activeCatId ? "active" : ""}`} onClick={() => onSelect(cat.id)}>
                      <span className="toc-item-label">{cat.label}</span>
                      <span className="toc-leader"></span>
                      <span className="toc-item-count">{isFull ? "✓" : `${done}/${cat.questions.length}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}

// Handwritten margin notes for field-notes mode (keyed by question id).
const FN_NOTES = { pw3: "classic — know cold", pw4: "★ asked everywhere", pw8: "redo!!", pw11: "sharding story →", api4: "IDOR sweep!", sc4: "use the script" };

function CategoryScreen({ catId, reviewed, flagged, openIds, fieldNotes, searchRef, onSelectCat, onToggleOpen, onToggleReviewed, onToggleFlag, onStartFocus }) {
  const { CATS, GROUPS } = window.PROTO_DATA;
  const [search, setSearch] = React.useState("");
  const [diff, setDiff] = React.useState("all");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => { setSearch(""); setDiff("all"); setSidebarOpen(false); }, [catId]);

  const isBookmarks = catId === BOOKMARKS_ID;
  const reveal = useReveal(catId);
  const cat = isBookmarks ? null : (protoCatById[catId] || CATS[0]);
  const group = cat ? GROUPS.find((g) => g.id === cat.group) : null;

  const source = isBookmarks
    ? protoAllQuestions.filter((q) => flagged.has(q.id))
    : cat.questions.map((q, i) => ({ ...q, catLabel: cat.label, idx: i + 1 }));

  const term = search.trim().toLowerCase();
  const filtered = source.filter((q) => {
    if (diff !== "all" && q.diff !== diff) return false;
    if (!term) return true;
    return (q.q + " " + q.answer).toLowerCase().includes(term);
  });

  const done = isBookmarks
    ? source.filter((q) => reviewed.has(q.id)).length
    : cat.questions.filter((q) => reviewed.has(q.id)).length;
  const total = isBookmarks ? source.length : cat.questions.length;
  const flaggedInCat = isBookmarks ? source.length : cat.questions.filter((q) => flagged.has(q.id)).length;

  return (
    <div className={`layout ${sidebarOpen ? "drawer-open" : ""}`}>
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      <TocSidebar
        activeCatId={catId}
        reviewed={reviewed}
        flaggedCount={flagged.size}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={onSelectCat}
        onSelectBookmarks={() => onSelectCat(BOOKMARKS_ID)}
      />
      <main className="main">
        <div className={`main-inner ${reveal}`}>
          <button className="toc-toggle" onClick={() => setSidebarOpen(true)}>
            <PIconMenu size={16} /> Contents
          </button>
          <div className="chapter-eyebrow">
            {isBookmarks ? "Bookmarks" : `Chapter ${group.numeral} · ${group.label}`}
          </div>
          <h1 className="chapter-title">{isBookmarks ? "Saved for later" : cat.label}</h1>
          <p className="chapter-desc">
            {isBookmarks
              ? "Questions you've starred for another pass. Untoggle the star on any card to remove it."
              : cat.desc}
          </p>
          <div className="chapter-meta">
            <span className="chapter-bar"><span style={{ width: total ? `${(done / total) * 100}%` : 0 }}></span></span>
            <span className="chapter-counts">
              {done} of {total} reviewed{!isBookmarks && flaggedInCat > 0 && <> · {flaggedInCat} bookmarked</>}
            </span>
            {!isBookmarks && (
              <button className="focus-launch" onClick={() => onStartFocus(cat.id)}>
                <PIconZap size={14} sw={2} /> Focus session
              </button>
            )}
          </div>
          <div className="controls">
            <input
              ref={searchRef}
              type="text"
              className="search"
              placeholder={isBookmarks ? "Search bookmarked questions…   (press /)" : "Search this topic…   (press /)"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="pills" role="tablist" aria-label="Difficulty filter">
              {["all", "easy", "mid", "hard"].map((d) => (
                <button key={d} className={`pill ${diff === d ? "active" : ""}`} role="tab" aria-selected={diff === d} onClick={() => setDiff(d)}>{d}</button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="empty">
              {isBookmarks
                ? "Nothing bookmarked yet. Star any question to save it here."
                : "No questions match. Try clearing search or changing difficulty."}
            </div>
          ) : (
            <div className={`q-list ${fieldNotes ? "fieldnotes" : ""}`}>
              {filtered.map((q, i) => (
                <QuestionRow
                  key={q.id}
                  item={q}
                  num={q.idx || i + 1}
                  reviewed={reviewed.has(q.id)}
                  flagged={flagged.has(q.id)}
                  open={openIds.has(q.id)}
                  sourceLabel={isBookmarks ? q.catLabel : null}
                  fieldNotes={fieldNotes}
                  note={FN_NOTES[q.id]}
                  delay={Math.min(i * 35, 420)}
                  onToggleOpen={() => onToggleOpen(q.id)}
                  onToggleReviewed={() => onToggleReviewed(q.id)}
                  onToggleFlag={() => onToggleFlag(q.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { CategoryScreen, BOOKMARKS_ID });
