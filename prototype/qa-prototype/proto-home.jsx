// Home screen — "Atlas": greeting, continue card, grouped category grid.

function HomeScreen({ reviewed, lastCatId, onOpenCategory, onResume }) {
  const { CATS, GROUPS } = window.PROTO_DATA;
  const totalDone = reviewed.size;
  const remaining = protoTotalCount - totalDone;
  const pct = Math.round((totalDone / protoTotalCount) * 100);

  const lastCat = protoCatById[lastCatId] || CATS[0];
  const lastDone = lastCat.questions.filter((q) => reviewed.has(q.id)).length;
  const nextQ = lastCat.questions.find((q) => !reviewed.has(q.id));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  let cardIdx = 0;
  const reveal = useReveal();

  return (
    <div className={`home ${reveal}`}>
      <div className="home-head">
        <div>
          <div className="home-date">{dateStr}</div>
          <h1 className="home-title">
            {greeting}<br />
            <em>{remaining} questions to go.</em>
          </h1>
          <div className="home-stat">
            <PRing pct={totalDone / protoTotalCount} />
            <div>
              <div className="home-stat-line1">{totalDone} of {protoTotalCount} reviewed</div>
              <div className="home-stat-line2">{pct}% of the full question bank</div>
            </div>
          </div>
        </div>
        <div className="continue-card">
          <div className="continue-eyebrow">Continue where you left off</div>
          <div className="continue-title">{lastCat.label}</div>
          <div className="continue-next">
            {nextQ ? <>Next up · “{nextQ.q}”</> : "All reviewed — take a victory lap or start a focus session."}
          </div>
          <div className="continue-row">
            <button className="continue-btn" onClick={() => onResume(lastCat.id)}>
              Resume <PIconArrowR size={14} sw={2} />
            </button>
            <span className="continue-track"><span style={{ width: `${(lastDone / lastCat.questions.length) * 100}%` }}></span></span>
            <span className="continue-count">{lastDone}/{lastCat.questions.length}</span>
          </div>
        </div>
      </div>

      {GROUPS.map((g) => {
        const cats = CATS.filter((c) => c.group === g.id);
        const gDone = cats.reduce((s, c) => s + c.questions.filter((q) => reviewed.has(q.id)).length, 0);
        const gTotal = cats.reduce((s, c) => s + c.questions.length, 0);
        return (
          <div key={g.id} className="home-group">
            <div className="home-group-head">
              <span className="home-group-numeral">{g.numeral}</span>
              <span className="home-group-label">{g.label}</span>
              <span className="home-group-line"></span>
              <span className="home-group-count">{gDone}/{gTotal}</span>
            </div>
            <div className="home-grid">
              {cats.map((cat) => {
                cardIdx += 1;
                const done = cat.questions.filter((q) => reviewed.has(q.id)).length;
                const total = cat.questions.length;
                const isFull = done === total;
                return (
                  <button key={cat.id} className="cat-card" style={{ "--d": `${Math.min(cardIdx * 45, 540)}ms` }} onClick={() => onOpenCategory(cat.id)}>
                    <span className="cat-card-top">
                      <span className="cat-card-num">{String(cardIdx).padStart(2, "0")}</span>
                      {isFull
                        ? <span className="cat-card-done">COMPLETE</span>
                        : <span className="cat-card-count">{done}<span className="of">/{total}</span></span>}
                    </span>
                    <span className="cat-card-label">{cat.label}</span>
                    <span className="cat-card-bar">
                      <span className={isFull ? "full" : ""} style={{ width: `${(done / total) * 100}%` }}></span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.HomeScreen = HomeScreen;
