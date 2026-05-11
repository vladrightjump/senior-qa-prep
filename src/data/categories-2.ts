import type { Category } from "../types";

const sql: Category = {
  id: "sql",
  label: "SQL fundamentals",
  desc: "Joins, indexes, query plans, data integrity for QA validation",
  questions: [
    {
      id: "83214253-2067-4c69-9bb5-ded7c41d4a10",
      q: "Explain INNER, LEFT, RIGHT, and FULL OUTER JOIN. When does QA use each?",
      diff: "easy",
      tags: ["sql", "joins"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="JOIN types as Venn diagrams">
  <style>
    .ti { font: 600 12px ui-sans-serif, system-ui; fill: currentColor; }
    .ax { font: 600 11px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .ring { fill: none; stroke: currentColor; stroke-width: 1.5; }
    .sel { fill: #2a9d8f; opacity: 0.55; }
  </style>
  <g transform="translate(10,30)">
    <text x="60" y="-12" text-anchor="middle" class="ti">INNER JOIN</text>
    <defs>
      <clipPath id="cA1"><circle cx="45" cy="55" r="32"/></clipPath>
      <clipPath id="cB1"><circle cx="75" cy="55" r="32"/></clipPath>
    </defs>
    <circle cx="45" cy="55" r="32" class="ring"/>
    <circle cx="75" cy="55" r="32" class="ring"/>
    <circle cx="45" cy="55" r="32" class="sel" clip-path="url(#cB1)"/>
    <text x="30" y="59" class="ax">A</text>
    <text x="86" y="59" class="ax">B</text>
    <text x="60" y="110" text-anchor="middle" class="sub">only matches</text>
  </g>
  <g transform="translate(140,30)">
    <text x="60" y="-12" text-anchor="middle" class="ti">LEFT JOIN</text>
    <defs>
      <clipPath id="cA2"><circle cx="45" cy="55" r="32"/></clipPath>
    </defs>
    <circle cx="45" cy="55" r="32" class="sel"/>
    <circle cx="45" cy="55" r="32" class="ring"/>
    <circle cx="75" cy="55" r="32" class="ring"/>
    <text x="30" y="59" class="ax">A</text>
    <text x="86" y="59" class="ax">B</text>
    <text x="60" y="110" text-anchor="middle" class="sub">all A + matches</text>
  </g>
  <g transform="translate(270,30)">
    <text x="60" y="-12" text-anchor="middle" class="ti">RIGHT JOIN</text>
    <circle cx="45" cy="55" r="32" class="ring"/>
    <circle cx="75" cy="55" r="32" class="sel"/>
    <circle cx="75" cy="55" r="32" class="ring"/>
    <text x="30" y="59" class="ax">A</text>
    <text x="86" y="59" class="ax">B</text>
    <text x="60" y="110" text-anchor="middle" class="sub">all B + matches</text>
  </g>
  <g transform="translate(400,30)">
    <text x="60" y="-12" text-anchor="middle" class="ti">FULL OUTER</text>
    <circle cx="45" cy="55" r="32" class="sel"/>
    <circle cx="75" cy="55" r="32" class="sel"/>
    <circle cx="45" cy="55" r="32" class="ring"/>
    <circle cx="75" cy="55" r="32" class="ring"/>
    <text x="30" y="59" class="ax">A</text>
    <text x="86" y="59" class="ax">B</text>
    <text x="60" y="110" text-anchor="middle" class="sub">everything</text>
  </g>
  <text x="260" y="180" text-anchor="middle" class="sub">LEFT JOIN + WHERE right.id IS NULL = canonical "find orphans" pattern</text>
</svg>
</div>
<ul>
<li><strong>INNER JOIN</strong> — only rows with matches in both tables.</li>
<li><strong>LEFT JOIN</strong> — all from left, matches from right (NULL otherwise).</li>
<li><strong>RIGHT JOIN</strong> — mirror of LEFT.</li>
<li><strong>FULL OUTER JOIN</strong> — everything from both.</li>
</ul>
<p><strong>QA use cases:</strong></p>
<pre class="code"><code>-- Find orders with no user (data integrity bug)
SELECT o.id FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- Find users with no orders
SELECT u.email FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;</code></pre>
<p><strong>LEFT JOIN + IS NULL</strong> = canonical pattern for finding orphans (broken FK relationships).</p>`
    },
    {
      id: "b639a26d-fb3b-491a-8c0c-f3957c2af54b",
      q: "Primary key vs. foreign key vs. unique constraint?",
      diff: "easy",
      tags: ["sql", "schema"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tables showing PK, FK, UNIQUE constraints">
  <style>
    .ti { font: 600 12px ui-sans-serif, system-ui; fill: currentColor; }
    .col { font: 11.5px ui-monospace, "SF Mono", Menlo, Consolas, monospace; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .pk { fill: #e9c46a; }
    .fk { fill: #0a3d6e; }
    .uq { fill: #2a9d8f; }
    .row { fill: var(--bg); stroke: currentColor; stroke-width: 1; opacity: 0.95; }
    .arrow { stroke: #0a3d6e; stroke-width: 1.5; fill: none; }
  </style>
  <text x="80" y="20" text-anchor="middle" class="ti">users</text>
  <rect x="20" y="28" width="180" height="120" rx="4" class="row"/>
  <rect x="20" y="28" width="180" height="22" rx="4" class="pk"/>
  <text x="30" y="44" class="col" fill="#222">🔑 id (PK)</text>
  <rect x="20" y="50" width="180" height="22" rx="0" class="uq" opacity="0.4"/>
  <text x="30" y="66" class="col">⊙ email (UNIQUE)</text>
  <text x="30" y="88" class="col">  name</text>
  <text x="30" y="108" class="col">  created_at</text>
  <text x="380" y="20" text-anchor="middle" class="ti">orders</text>
  <rect x="320" y="28" width="180" height="120" rx="4" class="row"/>
  <rect x="320" y="28" width="180" height="22" rx="4" class="pk"/>
  <text x="330" y="44" class="col" fill="#222">🔑 id (PK)</text>
  <rect x="320" y="50" width="180" height="22" rx="0" class="fk" opacity="0.45"/>
  <text x="330" y="66" class="col">→ user_id (FK)</text>
  <text x="330" y="88" class="col">  total</text>
  <text x="330" y="108" class="col">  status</text>
  <path d="M 200 60 Q 260 60 320 60" class="arrow"/>
  <text x="260" y="54" text-anchor="middle" class="sub">references users.id</text>
  <g transform="translate(20, 170)">
    <rect x="0" y="0" width="14" height="14" class="pk"/>
    <text x="20" y="11" class="sub">PRIMARY KEY — NOT NULL + UNIQUE, one per table</text>
  </g>
  <g transform="translate(20, 190)">
    <rect x="0" y="0" width="14" height="14" class="uq" opacity="0.6"/>
    <text x="20" y="11" class="sub">UNIQUE — column(s) unique, nullable, many per table</text>
  </g>
  <g transform="translate(290, 180)">
    <rect x="0" y="0" width="14" height="14" class="fk" opacity="0.6"/>
    <text x="20" y="11" class="sub">FOREIGN KEY — referential integrity</text>
    <text x="20" y="25" class="sub">ON DELETE: RESTRICT | CASCADE | SET NULL</text>
  </g>
</svg>
</div>
<ul>
<li><strong>PRIMARY KEY</strong> — unique row identifier. NOT NULL + UNIQUE. One per table. Backed by clustered index.</li>
<li><strong>FOREIGN KEY</strong> — references PK of another table. Enforces referential integrity.</li>
<li><strong>UNIQUE</strong> — column(s) must be unique, can be nullable, multiple per table.</li>
</ul>
<p>Test: delete a user with orders. <code>ON DELETE RESTRICT</code> fails the operation. <code>ON DELETE CASCADE</code> deletes orders too. Schema behavior here is critical for data tests.</p>`
    },
    {
      id: "3ef27da2-6ddc-40da-910e-8cc930bae35f",
      q: "Find the second highest salary in a table.",
      diff: "mid",
      tags: ["sql", "queries"],
      answer: `<pre class="code"><code>-- 1. LIMIT/OFFSET (MySQL, Postgres)
SELECT DISTINCT salary FROM employees
ORDER BY salary DESC LIMIT 1 OFFSET 1;

-- 2. Subquery
SELECT MAX(salary) FROM employees
WHERE salary &lt; (SELECT MAX(salary) FROM employees);

-- 3. Window function (cleanest for nth)
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) ranked WHERE rnk = 2;</code></pre>
<p><strong>Filters senior candidates:</strong> what if two share the highest? <code>DENSE_RANK</code> handles ties; <code>ROW_NUMBER</code> doesn't.</p>`
    },
    {
      id: "2b986c72-ecda-4d3e-b99d-909112f5a52a",
      q: "What is an index? When does it help, when does it hurt?",
      diff: "mid",
      tags: ["sql", "performance"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Index lookup vs full scan">
  <style>
    .ti { font: 600 12px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .row { fill: var(--bg); stroke: currentColor; stroke-width: 0.6; opacity: 0.5; }
    .hit { fill: #2a9d8f; }
    .miss { fill: #e76f51; opacity: 0.4; }
    .node { fill: #0a3d6e; }
    .link { stroke: currentColor; stroke-width: 1; fill: none; opacity: 0.6; }
  </style>
  <text x="115" y="16" text-anchor="middle" class="ti">❌ Full table scan</text>
  <text x="115" y="32" text-anchor="middle" class="sub">WHERE email = 'kate@x.com' on un-indexed column</text>
  <g transform="translate(20, 40)">
    <rect x="0" y="0" width="190" height="140" rx="3" class="row"/>
    <g>
      <rect x="2" y="2" width="186" height="12" class="miss"/>
      <rect x="2" y="14" width="186" height="12" class="miss"/>
      <rect x="2" y="26" width="186" height="12" class="miss"/>
      <rect x="2" y="38" width="186" height="12" class="miss"/>
      <rect x="2" y="50" width="186" height="12" class="miss"/>
      <rect x="2" y="62" width="186" height="12" class="hit"/>
      <rect x="2" y="74" width="186" height="12" class="miss"/>
      <rect x="2" y="86" width="186" height="12" class="miss"/>
      <rect x="2" y="98" width="186" height="12" class="miss"/>
      <rect x="2" y="110" width="186" height="12" class="miss"/>
      <rect x="2" y="122" width="186" height="12" class="miss"/>
    </g>
  </g>
  <text x="115" y="195" text-anchor="middle" class="sub">read every row → O(n)</text>
  <text x="395" y="16" text-anchor="middle" class="ti">✓ Index seek (B-tree)</text>
  <text x="395" y="32" text-anchor="middle" class="sub">CREATE INDEX idx_email ON users(email)</text>
  <g transform="translate(290, 50)">
    <rect x="80" y="0" width="50" height="22" rx="3" class="node"/>
    <text x="105" y="14" text-anchor="middle" class="sub" fill="#fff">root</text>
    <line x1="105" y1="22" x2="50" y2="45" class="link"/>
    <line x1="105" y1="22" x2="105" y2="45" class="link"/>
    <line x1="105" y1="22" x2="160" y2="45" class="link"/>
    <rect x="25" y="45" width="50" height="22" rx="3" class="node" opacity="0.7"/>
    <text x="50" y="59" text-anchor="middle" class="sub" fill="#fff">a–h</text>
    <rect x="80" y="45" width="50" height="22" rx="3" class="hit"/>
    <text x="105" y="59" text-anchor="middle" class="sub" fill="#fff">i–p</text>
    <rect x="135" y="45" width="50" height="22" rx="3" class="node" opacity="0.7"/>
    <text x="160" y="59" text-anchor="middle" class="sub" fill="#fff">q–z</text>
    <line x1="105" y1="67" x2="80" y2="90" class="link"/>
    <line x1="105" y1="67" x2="130" y2="90" class="link"/>
    <rect x="55" y="90" width="50" height="22" rx="3" class="node" opacity="0.7"/>
    <text x="80" y="104" text-anchor="middle" class="sub" fill="#fff">i–k</text>
    <rect x="105" y="90" width="50" height="22" rx="3" class="hit"/>
    <text x="130" y="104" text-anchor="middle" class="sub" fill="#fff">kate</text>
    <line x1="130" y1="112" x2="130" y2="130" class="link"/>
    <rect x="105" y="130" width="50" height="14" class="hit"/>
    <text x="130" y="141" text-anchor="middle" class="sub" fill="#fff">→ row ptr</text>
  </g>
  <text x="395" y="180" text-anchor="middle" class="sub">log₂ steps → O(log n)</text>
</svg>
<div class="illus-caption">Index trades write speed + storage for read speed. Wrong on low-cardinality, low-read columns.</div>
</div>
<p>B-tree (typically) data structure that lets the DB find rows without a full scan.</p>
<p><strong>Helps:</strong> WHERE on indexed columns, JOIN conditions, ORDER BY matching index, covering indexes (no table lookup).</p>
<p><strong>Hurts:</strong></p>
<ul>
<li>Every INSERT/UPDATE/DELETE updates all indexes — write overhead.</li>
<li>Disk and memory cost.</li>
<li>Wrapping column in function (<code>WHERE LOWER(email) = ...</code>) usually disables the index.</li>
<li>Indexing low-cardinality columns rarely helps.</li>
</ul>
<p>Use <code>EXPLAIN</code> to verify the index is actually used.</p>`
    },
    {
      id: "87e120eb-9cde-48e2-bec8-0f9eb25fde4c",
      q: "What is EXPLAIN? Walk through diagnosing a slow query.",
      diff: "hard",
      tags: ["sql", "performance"],
      answer: `<p><code>EXPLAIN</code> shows the planner's strategy: indexes used, join algorithms, estimated row counts.</p>
<div class="code-walk">
<pre class="code"><code>EXPLAIN ANALYZE
SELECT u.email, COUNT(o.id) FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.country = 'RO' GROUP BY u.email;

Limit (cost=12483.00..12500.00 rows=10 width=40) (actual time=842.1..843.0)
  -&gt; HashAggregate (cost=...) (actual rows=14201)
       -&gt; Hash Right Join (cost=...) (actual time=120..720)              ─ ①
            Hash Cond: (o.user_id = u.id)
            -&gt; Seq Scan on orders o (cost=0..9000) (actual rows=2_000_000) ─ ②
            -&gt; Hash (rows=14201)
                 -&gt; Seq Scan on users u                                    ─ ③
                      Filter: (country = 'RO')
                      Rows Removed by Filter: 985_799                       ─ ④
Planning Time: 0.5 ms
Execution Time: 843.1 ms                                                    ─ ⑤</code></pre>
<ol class="code-walk-notes">
  <li><span class="cw-num">1</span><span>Hash join — good for large unsorted sets. If you saw a Nested Loop here on millions of rows, that would be the smoking gun.</span></li>
  <li><span class="cw-num">2</span><span>Seq Scan on 2M-row <code>orders</code>. The JOIN forces it; <code>orders.user_id</code> needs an index to convert this to an Index Scan.</span></li>
  <li><span class="cw-num">3</span><span>Seq Scan on users too — <code>country</code> is unindexed.</span></li>
  <li><span class="cw-num">4</span><span>"Rows Removed by Filter: 985_799" — the planner read 1M rows to keep 14K. A partial index on <code>(country) WHERE country='RO'</code> or a B-tree on <code>country</code> would slash this.</span></li>
  <li><span class="cw-num">5</span><span>Actual time matters more than cost. Cost is a unit-less estimate; <code>ANALYZE</code> gives the real wall clock.</span></li>
</ol>
</div>
<p>Common fix here: <code>CREATE INDEX idx_orders_user_id ON orders(user_id)</code> and <code>CREATE INDEX idx_users_country ON users(country)</code>. Re-run EXPLAIN ANALYZE to confirm Index Scans replaced Seq Scans.</p>`
    },
    {
      id: "17c828de-0a58-4e7e-809a-d231cb2cdff0",
      q: "WHERE vs. HAVING?",
      diff: "easy",
      tags: ["sql"],
      diagram: `flowchart LR
  FROM["FROM orders"] --> WHERE["WHERE created_at &gt;= '2026-01-01'<br/>(filter ROWS before grouping)"]
  WHERE --> GROUP["GROUP BY customer_id"]
  GROUP --> HAVING["HAVING COUNT(*) &gt; 5<br/>(filter GROUPS after aggregation)"]
  HAVING --> SELECT["SELECT customer_id, COUNT(*)"]
  SELECT --> ORDER["ORDER BY count DESC"]
  classDef early fill:#2a9d8f,color:#fff
  classDef late fill:#e9c46a,color:#222
  class WHERE early
  class HAVING late`,
      answer: `<ul>
<li><strong>WHERE</strong> filters rows <em>before</em> aggregation.</li>
<li><strong>HAVING</strong> filters groups <em>after</em> aggregation.</li>
</ul>
<pre class="code"><code>SELECT customer_id, COUNT(*) AS orders
FROM orders
WHERE created_at &gt;= '2026-01-01'  -- before grouping
GROUP BY customer_id
HAVING COUNT(*) &gt; 5;  -- after grouping</code></pre>
<p>Always prefer WHERE when possible — filtering before aggregation is much faster.</p>`
    },
    {
      id: "136a4f8a-e6d2-441b-bce7-f2cce66c7d73",
      q: "What is a transaction? Explain ACID.",
      diff: "mid",
      tags: ["sql", "transactions"],
      diagram: `graph TB
  TXN["BEGIN TRANSACTION"] --> OPS["multiple writes / reads"]
  OPS --> END{"COMMIT or ROLLBACK?"}
  END -->|"commit"| DONE["state persisted"]
  END -->|"rollback / crash"| UNDO["all changes undone"]
  A["A — Atomicity<br/>all-or-nothing"] -.-> END
  C["C — Consistency<br/>constraints hold"] -.-> OPS
  I["I — Isolation<br/>RU → RC → RR → Serializable"] -.-> OPS
  D["D — Durability<br/>survives crashes"] -.-> DONE`,
      answer: `<ul>
<li><strong>Atomicity</strong> — all-or-nothing. Failure rolls back everything.</li>
<li><strong>Consistency</strong> — moves from valid state to valid state. Constraints hold.</li>
<li><strong>Isolation</strong> — concurrent transactions don't interfere. Levels: READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE.</li>
<li><strong>Durability</strong> — once committed, survives crashes.</li>
</ul>
<p>Test: deduct money from A, add to B. If second step fails, both must roll back. A test asserting only step 2 misses the atomicity check.</p>`
    },
    {
      id: "309e3e19-723f-48e3-97c9-137420cac4f7",
      q: "Find duplicate emails in a users table.",
      diff: "mid",
      tags: ["sql"],
      answer: `<pre class="code"><code>-- Group + HAVING
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) &gt; 1;

-- With full row data using window function
SELECT id, email FROM (
  SELECT id, email, COUNT(*) OVER (PARTITION BY email) AS cnt
  FROM users
) u WHERE cnt &gt; 1;</code></pre>
<p>Email duplicates break "find user by email" lookups and cause auth issues. A real data-quality test.</p>`
    },
    {
      id: "ad5f8bd1-382e-4330-ab0f-74debcb8accc",
      q: "How do NULLs behave in SQL? List 3 gotchas.",
      diff: "mid",
      tags: ["sql"],
      diagram: `flowchart TB
  E1["NULL = NULL"] --> R1["UNKNOWN<br/>(not TRUE!)"]
  E2["NULL != 'x'"] --> R1
  E3["5 + NULL"] --> R2["NULL"]
  E4["WHERE col = NULL"] --> R3["returns 0 rows<br/>(use IS NULL)"]
  E5["COUNT(*)"] --> R4["counts NULLs ✓"]
  E6["COUNT(col)"] --> R5["skips NULLs"]
  E7["WHERE col != 'x'"] --> R6["excludes col IS NULL too<br/>(add OR col IS NULL)"]
  classDef bad fill:#e76f51,color:#fff
  classDef good fill:#2a9d8f,color:#fff
  classDef warn fill:#e9c46a,color:#222
  class R1,R2,R3,R6 warn
  class R4 good
  class R5 bad`,
      answer: `<ol>
<li><strong>NULL is not equal to anything, even itself.</strong> <code>WHERE col = NULL</code> returns nothing. Use <code>IS NULL</code>.</li>
<li><strong>NULL in arithmetic = NULL.</strong> <code>5 + NULL = NULL</code>. Use <code>COALESCE(col, 0)</code>.</li>
<li><strong>COUNT(*) counts NULLs; COUNT(col) doesn't.</strong></li>
</ol>
<pre class="code"><code>-- ❌ Excludes rows with salary IS NULL
SELECT COUNT(*) FROM employees WHERE salary != 50000;

-- ✅ Includes them
SELECT COUNT(*) FROM employees
WHERE salary != 50000 OR salary IS NULL;</code></pre>
<p>Three-valued logic (TRUE / FALSE / UNKNOWN) is the source of many "worked in dev, not in prod" bugs.</p>`
    },
    {
      id: "4c295db8-589a-4f5f-834f-e6ea56f93d1c",
      q: "Subquery vs. CTE — when to prefer each?",
      diff: "mid",
      tags: ["sql"],
      answer: `<pre class="code"><code>-- Subquery
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total &gt; 1000);

-- CTE — named, reusable, more readable
WITH big_spenders AS (
  SELECT user_id, SUM(total) AS lifetime
  FROM orders GROUP BY user_id HAVING SUM(total) &gt; 1000
)
SELECT u.email, b.lifetime
FROM users u JOIN big_spenders b ON u.id = b.user_id;</code></pre>
<p><strong>Prefer CTE:</strong> reused multiple times, recursion, readability matters.</p>
<p><strong>Prefer subquery:</strong> simple one-off filtering or scalar lookups.</p>
<p>Senior nuance: in some DBs CTEs were optimization fences (Postgres pre-12). Modern engines handle both similarly.</p>`
    },
    {
      id: "e54be14b-67c6-4620-b66a-b6c412df8a91",
      q: "Detect orders with totals not matching their line items sum.",
      diff: "hard",
      tags: ["sql", "data-integrity"],
      answer: `<pre class="code"><code>SELECT
  o.id,
  o.total AS recorded_total,
  SUM(li.price * li.quantity) AS computed_total,
  o.total - SUM(li.price * li.quantity) AS diff
FROM orders o
JOIN line_items li ON li.order_id = o.id
GROUP BY o.id, o.total
HAVING o.total != SUM(li.price * li.quantity);</code></pre>
<p>Real production audit query. Catches denormalization drift — order total cached on parent row, updates not atomic with line item changes. Should return zero rows. If not, file a bug.</p>`
    },
    {
      id: "685956b6-d290-4fb4-b5f5-67b5be1cc711",
      q: "What is a window function? Show one in use.",
      diff: "hard",
      tags: ["sql"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Window function vs GROUP BY">
  <style>
    .ti { font: 600 11px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .mono { font: 11.5px ui-monospace, "SF Mono", Menlo, Consolas, monospace; fill: currentColor; }
    .row { fill: var(--bg); stroke: currentColor; stroke-width: 0.6; }
    .part1 { fill: #2a9d8f; opacity: 0.18; stroke: #2a9d8f; }
    .part2 { fill: #e9c46a; opacity: 0.25; stroke: #e9c46a; }
    .out { fill: #0a3d6e; }
  </style>
  <text x="10" y="16" class="ti">GROUP BY — collapses rows</text>
  <rect x="10" y="22" width="200" height="80" class="row"/>
  <text x="20" y="38" class="mono">cust  total</text>
  <text x="20" y="54" class="mono">A     30</text>
  <text x="20" y="68" class="mono">A     50  → sum 80</text>
  <text x="20" y="82" class="mono">B     20  → sum 20</text>
  <text x="100" y="100" class="sub">2 output rows</text>
  <text x="260" y="16" class="ti">Window — preserves rows</text>
  <rect x="260" y="22" width="250" height="80" class="row"/>
  <text x="270" y="38" class="mono">cust  total  SUM() OVER (...)</text>
  <text x="270" y="54" class="mono">A     30     30</text>
  <text x="270" y="68" class="mono">A     50     80</text>
  <text x="270" y="82" class="mono">B     20     20</text>
  <text x="360" y="100" class="sub">3 output rows (running total)</text>
  <text x="10" y="130" class="ti">PARTITION BY customer_id — windows isolate per partition</text>
  <g transform="translate(10, 140)">
    <rect x="0" y="0" width="240" height="60" class="part1"/>
    <text x="120" y="14" text-anchor="middle" class="ti" fill="#2a9d8f">partition: customer A</text>
    <text x="10" y="32" class="mono">ord1 30  rank=1</text>
    <text x="10" y="48" class="mono">ord2 50  rank=2</text>
    <rect x="260" y="0" width="240" height="60" class="part2"/>
    <text x="380" y="14" text-anchor="middle" class="ti" fill="#b8860b">partition: customer B</text>
    <text x="270" y="32" class="mono">ord3 20  rank=1</text>
    <text x="270" y="48" class="mono">ord4 10  rank=2</text>
  </g>
  <text x="10" y="220" class="sub">Rank restarts inside each partition. Same idea for SUM, LAG, LEAD, ROW_NUMBER, etc.</text>
</svg>
</div>
<p>Window functions compute a value for each row using a "window" of related rows — without collapsing rows like GROUP BY does.</p>
<pre class="code"><code>-- Running total per customer
SELECT
  customer_id,
  order_id,
  total,
  SUM(total) OVER (
    PARTITION BY customer_id
    ORDER BY created_at
  ) AS running_total
FROM orders;

-- Rank within partition
SELECT customer_id, total,
  RANK() OVER (PARTITION BY customer_id ORDER BY total DESC) AS rnk
FROM orders;</code></pre>
<p>Common functions: <code>ROW_NUMBER</code>, <code>RANK</code>, <code>DENSE_RANK</code>, <code>LAG</code>, <code>LEAD</code>, <code>SUM</code>/<code>AVG</code> as window. Essential for analytics queries.</p>`
    },
    {
      id: "e88005b5-4f38-4e39-9462-b8ae510b75fc",
      q: "What's the difference between TRUNCATE, DELETE, and DROP?",
      diff: "easy",
      tags: ["sql"],
      answer: `<ul>
<li><strong>DELETE</strong> — DML. Removes rows. Can be filtered with WHERE. Logged, slower. Triggers fire. Rolls back in transaction.</li>
<li><strong>TRUNCATE</strong> — DDL. Removes all rows. Fast, minimally logged. No WHERE. Resets identity counters. May not roll back depending on DB.</li>
<li><strong>DROP</strong> — DDL. Removes the table itself. Schema gone.</li>
</ul>
<p>For test cleanup: TRUNCATE if you can — fastest. DELETE if you need triggers or WHERE.</p>`
    },
    {
      id: "42bb367d-1065-45cd-9015-a606295c6bc9",
      q: "What is an n+1 query problem and how do you detect it?",
      diff: "hard",
      tags: ["sql", "performance"],
      diagram: `sequenceDiagram
  participant App as App
  participant DB as DB
  Note over App,DB: N+1 — bad
  App->>DB: SELECT * FROM users  (1 query, 100 rows)
  DB-->>App: 100 users
  loop for each user
    App->>DB: SELECT * FROM orders WHERE user_id=?
    DB-->>App: orders (×100)
  end
  Note over App,DB: 101 queries 🔥
  Note over App,DB: Fix — eager load
  App->>DB: SELECT u.*, o.* FROM users u<br/>LEFT JOIN orders o ON o.user_id=u.id
  DB-->>App: rows
  Note over App,DB: 1 query ✓`,
      answer: `<p>An ORM bug: fetching N parent rows, then issuing 1 query per parent for related data. 100 parents = 101 queries instead of 1 with a JOIN.</p>
<pre class="code"><code>// Pseudocode causing N+1
const users = await db.users.findMany();  // 1 query
for (const user of users) {
  user.orders = await db.orders.findMany({ where: { userId: user.id } });  // N queries
}

// Fix: eager load with JOIN
const users = await db.users.findMany({ include: { orders: true } });  // 1 query</code></pre>
<p><strong>Detect in tests:</strong> count queries during a request. Many ORMs have a query-count assertion or middleware. <code>EXPLAIN</code> on individual queries doesn't catch it — the issue is the count, not any single query.</p>`
    },
    {
      id: "d34a0d2c-bc47-407b-83af-0371787ec0bd",
      q: "Test that a UNIQUE constraint actually works.",
      diff: "mid",
      tags: ["sql", "data-integrity"],
      answer: `<pre class="code"><code>test('email column enforces uniqueness', async ({ db }) =&gt; {
  await db.users.create({ data: { email: 'dup@test.com' } });

  await expect(
    db.users.create({ data: { email: 'dup@test.com' } })
  ).rejects.toThrow(/unique constraint/i);
});

// Edge case: case sensitivity
test('uniqueness should be case-insensitive', async ({ db }) =&gt; {
  await db.users.create({ data: { email: 'Test@example.com' } });
  // Whether this should succeed depends on your spec
  await expect(
    db.users.create({ data: { email: 'test@example.com' } })
  ).rejects.toThrow(/unique constraint/i);
});</code></pre>
<p>Uniqueness on emails is often case-insensitive in spec but case-sensitive in the DB column. Test the actual behavior, not the assumed one.</p>`
    },
    {
      id: "77c68bb1-11ca-432f-adf1-d9b56e8fccf8",
      q: "What's the difference between INNER JOIN and CROSS JOIN?",
      diff: "easy",
      tags: ["sql", "joins"],
      answer: `<ul>
<li><strong>INNER JOIN</strong> — combines rows where the ON condition matches.</li>
<li><strong>CROSS JOIN</strong> — Cartesian product. Every row from A paired with every row from B. No ON clause.</li>
</ul>
<pre class="code"><code>-- 4 sizes × 6 colors = 24 rows
SELECT s.size, c.color
FROM sizes s
CROSS JOIN colors c;</code></pre>
<p>Practical use: generate all combinations (variants for products, dates × users for reports). Accidental CROSS JOIN (forgotten ON clause) is a common bug — catastrophic for large tables.</p>`
    },
    {
      id: "4b95a2b8-4ed7-43e1-93d4-aee078945f01",
      q: "How do you write a query to find the top 3 best-selling products per category?",
      diff: "hard",
      tags: ["sql", "queries"],
      answer: `<p>Classic "top N per group" — window function is the cleanest.</p>
<div class="code-walk">
<pre class="code"><code>SELECT category_id, product_id, total_sold
FROM (
  SELECT
    p.category_id,
    p.id AS product_id,
    SUM(oi.quantity) AS total_sold,                                  -- ①
    ROW_NUMBER() OVER (                                              -- ②
      PARTITION BY p.category_id                                     -- ③
      ORDER BY SUM(oi.quantity) DESC                                 -- ④
    ) AS rnk
  FROM products p
  JOIN order_items oi ON oi.product_id = p.id
  GROUP BY p.category_id, p.id                                       -- ⑤
) ranked
WHERE rnk &lt;= 3;                                                      -- ⑥</code></pre>
<ol class="code-walk-notes">
  <li><span class="cw-num">1</span><span>Aggregate first: total sold per product. The window will rank these aggregates.</span></li>
  <li><span class="cw-num">2</span><span><code>ROW_NUMBER</code> assigns 1, 2, 3, 4… with ties broken arbitrarily. Pick <code>DENSE_RANK</code> if ties should both fit in the top 3.</span></li>
  <li><span class="cw-num">3</span><span><code>PARTITION BY</code> restarts numbering inside each category — so each category gets its own 1..N ranking.</span></li>
  <li><span class="cw-num">4</span><span>Window's <code>ORDER BY</code> defines the ranking direction. Highest sold = rank 1.</span></li>
  <li><span class="cw-num">5</span><span>Both <code>category_id</code> and <code>p.id</code> in <code>GROUP BY</code> — required since we aggregate but want one row per product.</span></li>
  <li><span class="cw-num">6</span><span>Filter on <code>rnk</code> must be outside the window — you can't reference a window alias in the same SELECT's WHERE. That's why this is a subquery.</span></li>
</ol>
</div>
<p>Senior nuance: <code>ROW_NUMBER</code> vs <code>DENSE_RANK</code> vs <code>RANK</code> — picks the policy on ties. Ties (1, 2, 2, 3) vs ties + skip (1, 2, 2, 4) vs no ties (1, 2, 3, 4).</p>`
    },
    {
      id: "ac162a1a-8874-409e-b7ba-563e235d5f42",
      q: "Difference between a clustered and non-clustered index?",
      diff: "mid",
      tags: ["sql", "indexes"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Clustered vs non-clustered index storage layout">
  <style>
    .ti { font: 600 12px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .mono { font: 11px ui-monospace, "SF Mono", Menlo, Consolas, monospace; fill: currentColor; }
    .frame { fill: var(--bg); stroke: currentColor; stroke-width: 1; }
    .data { fill: #0a3d6e; }
    .idx { fill: #2a9d8f; }
    .arrow { stroke: currentColor; stroke-width: 1; fill: none; opacity: 0.6; }
  </style>
  <text x="130" y="14" text-anchor="middle" class="ti">Clustered (PK on id)</text>
  <text x="130" y="28" text-anchor="middle" class="sub">data PHYSICALLY ordered by id</text>
  <rect x="20" y="36" width="220" height="120" rx="3" class="frame"/>
  <rect x="20" y="36" width="220" height="20" class="data"/>
  <text x="130" y="50" text-anchor="middle" class="mono" fill="#fff">id   | email | name | …</text>
  <text x="30" y="70" class="mono">1   alice@   Alice</text>
  <text x="30" y="86" class="mono">2   bob@     Bob</text>
  <text x="30" y="102" class="mono">3   carol@   Carol</text>
  <text x="30" y="118" class="mono">4   dan@     Dan</text>
  <text x="30" y="134" class="mono">5   eve@     Eve</text>
  <text x="130" y="150" text-anchor="middle" class="sub">one per table · lookup by id = O(log n) + zero hops</text>
  <text x="390" y="14" text-anchor="middle" class="ti">Non-clustered (idx on email)</text>
  <text x="390" y="28" text-anchor="middle" class="sub">separate structure + row pointer</text>
  <rect x="290" y="36" width="100" height="120" rx="3" class="frame"/>
  <rect x="290" y="36" width="100" height="20" class="idx"/>
  <text x="340" y="50" text-anchor="middle" class="mono" fill="#fff">email → ptr</text>
  <text x="300" y="70" class="mono">alice@ →</text>
  <text x="300" y="86" class="mono">bob@   →</text>
  <text x="300" y="102" class="mono">carol@ →</text>
  <text x="300" y="118" class="mono">dan@   →</text>
  <text x="300" y="134" class="mono">eve@   →</text>
  <rect x="430" y="36" width="80" height="120" rx="3" class="frame"/>
  <rect x="430" y="36" width="80" height="20" class="data"/>
  <text x="470" y="50" text-anchor="middle" class="mono" fill="#fff">table</text>
  <text x="438" y="70" class="mono">1 alice</text>
  <text x="438" y="86" class="mono">2 bob</text>
  <text x="438" y="102" class="mono">3 carol</text>
  <text x="438" y="118" class="mono">4 dan</text>
  <text x="438" y="134" class="mono">5 eve</text>
  <path d="M 390 75 Q 410 75 430 75" class="arrow" marker-end="url(#a)"/>
  <defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="currentColor" opacity="0.6"/></marker></defs>
  <text x="390" y="170" text-anchor="middle" class="sub">many per table · extra "key lookup" unless covering</text>
  <text x="260" y="200" text-anchor="middle" class="sub">More non-clustered indexes ⇒ faster reads on those columns, slower writes (all indexes update).</text>
</svg>
</div>
<ul>
<li><strong>Clustered index</strong> — defines the physical storage order of the table. One per table (typically the primary key). Lookups by clustered key are fastest because data is right there.</li>
<li><strong>Non-clustered index</strong> — separate structure with pointers to the table rows. Many per table. Lookups require an extra "key lookup" step to fetch full row data, unless the index is "covering" (includes all needed columns).</li>
</ul>
<p>Trade-off: more non-clustered indexes = faster reads on those columns, slower writes (every INSERT/UPDATE updates all indexes). The covering index pattern (<code>INCLUDE</code> in SQL Server) avoids the lookup step.</p>`
    },
    {
      id: "95bdcbcf-54f5-4367-972a-895b615fa784",
      q: "Test that a backend correctly enforces a foreign key cascade delete.",
      diff: "mid",
      tags: ["sql", "data-integrity"],
      answer: `<pre class="code"><code>test('deleting user cascades to orders', async ({ db }) =&gt; {
  // Arrange
  const user = await db.users.create({ data: { email: 'test@x.com' } });
  await db.orders.create({ data: { userId: user.id, total: 100 } });
  await db.orders.create({ data: { userId: user.id, total: 200 } });

  // Act
  await db.users.delete({ where: { id: user.id } });

  // Assert: orders gone too
  const orphaned = await db.orders.findMany({ where: { userId: user.id } });
  expect(orphaned).toHaveLength(0);
});

test('CASCADE doesn\\'t affect unrelated data', async ({ db }) =&gt; {
  const userA = await db.users.create({ data: { email: 'a@x.com' } });
  const userB = await db.users.create({ data: { email: 'b@x.com' } });
  await db.orders.create({ data: { userId: userB.id, total: 50 } });

  await db.users.delete({ where: { id: userA.id } });

  const bsOrders = await db.orders.findMany({ where: { userId: userB.id } });
  expect(bsOrders).toHaveLength(1);
});</code></pre>
<p>The negative test (CASCADE doesn't over-delete) is the senior signal — easy to over-cascade, hard to recover.</p>`
    },
  ]
};

const frameworkArch: Category = {
  id: "framework-arch",
  label: "Framework & architecture",
  desc: "Designing maintainable test frameworks that scale beyond one project",
  questions: [
    {
      id: "5e525a1c-fcab-4899-9333-a20ebac69ddd",
      q: "Walk through the folder structure of a senior-grade Playwright + TS framework.",
      diff: "mid",
      tags: ["architecture"],
      diagram: `graph TD
  ROOT["project-root/"] --> TESTS["tests/<br/>specs only"]
  ROOT --> PAGES["pages/<br/>POMs (UI)"]
  ROOT --> API["api/<br/>REST wrappers"]
  ROOT --> FIX["fixtures/<br/>composed test export"]
  ROOT --> DATA["data/<br/>factories"]
  ROOT --> UTILS["utils/"]
  ROOT --> SCHEMAS["schemas/<br/>JSON Schemas"]
  ROOT --> CFG["config/<br/>per-env"]
  TESTS --> CHK[checkout/]
  TESTS --> AUTH[auth/]
  TESTS --> APIT[api/]`,
      answer: `<pre class="code"><code>project-root/
├── tests/                  # Test specs only — no logic
│   ├── checkout/
│   ├── auth/
│   └── api/
├── pages/                  # Page Objects (UI only)
│   ├── BasePage.ts
│   └── CheckoutPage.ts
├── api/                    # API clients (REST wrappers)
│   ├── APIClient.ts
│   └── OrderAPI.ts
├── fixtures/               # Custom Playwright fixtures
│   ├── auth.fixture.ts
│   ├── data.fixture.ts
│   └── index.ts            # composed test export
├── data/                   # Test data factories
├── utils/                  # Shared utilities
├── schemas/                # JSON schemas
├── config/                 # Per-env configs
├── playwright.config.ts
└── tsconfig.json</code></pre>
<p><strong>Senior signals:</strong> separation of UI/API layers, factories not static JSON, composed fixtures, schemas as first-class artifacts.</p>`
    },
    {
      id: "ddfae3c3-4f5b-4be8-a46b-ded285143a21",
      q: "What is POM and what's a common anti-pattern?",
      diff: "mid",
      tags: ["pom"],
      answer: `<p>POM encapsulates UI interaction in classes — one per page or major component.</p>
<div class="code-walk">
<pre class="code"><code>// ❌ Anti-pattern POM
export class CheckoutPage {
  page: Page;                                                       // ①
  submitButton: Locator;                                            // ②
  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.locator('button.btn-primary');         // ③
  }
  async clickSubmitButton() { await this.submitButton.click(); }    // ④
  getCartItem(idx: number) {                                        // ⑤
    return this.page.locator('.cart-item').nth(idx);
  }
}

// ✓ Senior POM
export class CheckoutPage {
  private readonly page: Page;
  private readonly placeOrderBtn: Locator;
  private readonly confirmation: Locator;
  constructor(page: Page) {
    this.page = page;
    this.placeOrderBtn = page.getByRole('button', { name: 'Place order' });
    this.confirmation = page.getByRole('heading', { name: /order confirmed/i });
  }
  async placeOrder() {                                              // ⑥
    await this.placeOrderBtn.click();
    await expect(this.confirmation).toBeVisible();
  }
}</code></pre>
<ol class="code-walk-notes">
  <li><span class="cw-num">1</span><span><code>page</code> is public — tests can reach in and bypass the POM entirely. Encapsulation broken.</span></li>
  <li><span class="cw-num">2</span><span>Locator is public — tests can grab it, build their own chains, and the POM no longer controls behavior.</span></li>
  <li><span class="cw-num">3</span><span>CSS-class selector breaks on the next style refactor. Use <code>getByRole</code>/<code>getByTestId</code>.</span></li>
  <li><span class="cw-num">4</span><span>Method name leaks implementation. The test reads <code>clickSubmitButton</code> instead of <code>placeOrder</code> — intent is lost.</span></li>
  <li><span class="cw-num">5</span><span>Returning a Locator from a public method invites tests to grow brittle chains outside the POM.</span></li>
  <li><span class="cw-num">6</span><span>Intent-named, fully private internals, asserts its own post-condition. Tests just call <code>placeOrder()</code> and trust the outcome.</span></li>
</ol>
</div>
<p>Other anti-patterns: assertions sprawled into POM (precondition checks are OK; outcome assertions belong in the test), inheritance 5 levels deep (prefer composition). Modern alternative: <strong>Feature Object</strong> — organize by user-facing feature instead of page, often better for SPAs.</p>`
    },
    {
      id: "673a4596-9bc0-40c6-9442-2625e44e9409",
      q: "Fixture composition pattern — why does it matter at scale?",
      diff: "hard",
      tags: ["fixtures", "architecture"],
      diagram: `graph TD
  BASE["@playwright/test base"] --> AUTH["auth.fixture.ts<br/>{ authedPage }"]
  BASE --> DATA["data.fixture.ts<br/>{ testUser }"]
  BASE --> API["api.fixture.ts<br/>{ apiClient }"]
  BASE --> CART["cart.fixture.ts<br/>{ seededCart }"]
  AUTH --> MERGE["fixtures/index.ts<br/>mergeTests(...)"]
  DATA --> MERGE
  API --> MERGE
  CART --> MERGE
  MERGE --> TESTS["tests/*.spec.ts<br/>import { test } from '@/fixtures'"]`,
      answer: `<pre class="code"><code>// auth.fixture.ts
export const test = base.extend&lt;{ authedPage: Page }&gt;({ ... });

// data.fixture.ts
export const test = base.extend&lt;{ testUser: User }&gt;({ ... });

// fixtures/index.ts — compose
import { test as authTest } from './auth.fixture';
import { test as dataTest } from './data.fixture';
import { mergeTests } from '@playwright/test';

export const test = mergeTests(authTest, dataTest);</code></pre>
<p><strong>Why it matters:</strong> smaller files easier to review, independent ownership across teams, no "god fixture" — single 800-line file destroys scale.</p>`
    },
    {
      id: "295b004b-204b-4fa9-ad67-1a1fc842bfc8",
      q: "How do you decide between E2E, integration, and unit tests?",
      diff: "hard",
      tags: ["strategy", "pyramid"],
      diagram: `flowchart TD
  Q{"What am I testing?"}
  Q -->|"Pure logic, no I/O"| UNIT["Unit test<br/>(ms, isolated)"]
  Q -->|"Module / API + DB"| INT["Integration test<br/>(seconds)"]
  Q -->|"Critical user journey"| E2E["E2E<br/>(minutes, full stack)"]
  Q -->|"Other"| ASK{"Cheapest test<br/>that gives confidence?"}
  ASK --> UNIT
  ASK --> INT
  ASK --> E2E`,
      answer: `<ul>
<li><strong>Unit</strong> — pure logic. Cart math, formatters, validators. Fast, deterministic, no I/O.</li>
<li><strong>Integration / component</strong> — module interaction. UI form with validation, API + DB.</li>
<li><strong>E2E</strong> — critical journeys. Login → browse → cart → checkout. Slow, expensive, full-stack proof.</li>
</ul>
<p><strong>Senior heuristic:</strong> "what's the cheapest test that gives me confidence?" Don't write E2E for date formatting. Don't write unit test for "the entire checkout flow".</p>`
    },
    {
      id: "2e3215e7-1c47-4163-8574-960d55e0af13",
      q: "Devs writing tests vs. QA writing tests — what's the difference?",
      diff: "mid",
      tags: ["strategy"],
      answer: `<p><strong>Devs</strong> test what they wrote — happy paths, known boundaries, with bias toward "the code I just wrote works".</p>
<p><strong>QA</strong> tests the system as users would — adversarial, in user journeys, across feature boundaries. QA owns:</p>
<ul>
<li>Cross-feature integration (checkout + promotions + tax + currency).</li>
<li>Negative paths and edge cases.</li>
<li>Test strategy at suite level (automated/manual/exploratory mix).</li>
<li>Quality of the test suite as a product (flakiness, gaps, runtime).</li>
</ul>
<p>Both should write tests. Senior framing: <strong>devs write code, QA owns quality strategy.</strong></p>`
    },
    {
      id: "3fd71681-525f-40c5-bc9e-6e52f95351e5",
      q: "How do you prevent a test framework from rotting?",
      diff: "hard",
      tags: ["architecture", "process"],
      answer: `<p>Test code is production code:</p>
<ul>
<li>Code review test PRs same as features.</li>
<li>Lint rules — eslint-plugin-playwright, no-floating-promises.</li>
<li>POM enforcement — block PRs with raw selectors in tests.</li>
<li>Track flakiness rate as a visible metric.</li>
<li>Quarantine flaky tests with a JIRA ticket.</li>
<li>Quarterly framework audits — slowest tests, longest files.</li>
<li>Documentation + runbook.</li>
<li>Refactor mercilessly.</li>
</ul>`
    },
    {
      id: "7ceb0045-7b3d-4c62-904b-9bb09af400a1",
      q: "What is Arrange-Act-Assert? Show it in a Playwright test.",
      diff: "easy",
      tags: ["patterns"],
      answer: `<pre class="code"><code>test('user can place an order', async ({ checkoutPage, testUser }) =&gt; {
  // Arrange
  await checkoutPage.goto();
  await checkoutPage.addItemToCart('SKU-001');

  // Act
  await checkoutPage.placeOrder();

  // Assert
  await expect(checkoutPage.orderConfirmation).toBeVisible();
  await expect(checkoutPage.orderNumber).toMatch(/^ORD-\\d+$/);
});</code></pre>
<p>Three sections separated by blank lines. Reading the test reveals intent. Anti-pattern: interleaving — clicking, asserting, clicking — failures hard to localize.</p>`
    },
    {
      id: "eaa1b487-b0d7-4e75-b26d-2f4a46652516",
      q: "What are the four planes of a scalable test framework?",
      diff: "hard",
      tags: ["architecture", "scale"],
      diagram: `graph TB
  EXEC["1. Execution plane<br/>workers, sharding, parallelism<br/><i>how fast tests run</i>"]
  AUTH["2. Authoring plane<br/>POMs, fixtures, factories<br/><i>how tests are written</i>"]
  DATA["3. Data plane<br/>test data, seeding, isolation<br/><i>what tests run against</i>"]
  OBS["4. Observability plane<br/>reports, traces, dashboards<br/><i>what tests tell us</i>"]
  EXEC --- AUTH
  AUTH --- DATA
  DATA --- OBS`,
      answer: `<ol>
<li><strong>Execution plane</strong> — workers, sharding, parallelism. How fast tests run.</li>
<li><strong>State plane</strong> — test data isolation, DB state. Without this, parallelism causes flakiness.</li>
<li><strong>Dependency plane</strong> — external services, rate limits, mocks.</li>
<li><strong>Observability plane</strong> — flakiness metrics, runtime trends, failure clustering.</li>
</ol>
<p>Most teams design only execution plane and wonder why their suite collapses at scale. The other three don't auto-emerge.</p>`
    },
    {
      id: "8b0b81fb-ed13-4c02-a618-f88538d44dd2",
      q: "Architect a test framework shared across 4 product teams.",
      diff: "hard",
      tags: ["architecture", "scale"],
      diagram: `graph TB
  subgraph PLAT["Platform team (owns core)"]
    CORE["@org/test-core<br/>npm package, semver"]
    TPL["shared CI templates<br/>GH Actions reusable workflows"]
    DOC["docs site<br/>+ RFCs for breaking changes"]
  end
  subgraph TEAMS["Product teams (own tests)"]
    T1["Team A<br/>repo: app-a-tests"]
    T2["Team B<br/>repo: app-b-tests"]
    T3["Team C<br/>repo: app-c-tests"]
    T4["Team D<br/>repo: app-d-tests"]
  end
  CORE --> T1
  CORE --> T2
  CORE --> T3
  CORE --> T4
  TPL -.-> T1
  TPL -.-> T2
  TPL -.-> T3
  TPL -.-> T4
  T1 -. RFC / PR .-> CORE
  T2 -. office hours .-> PLAT
  classDef plat fill:#0a3d6e,color:#fff
  classDef team fill:#2a9d8f,color:#fff
  class CORE,TPL,DOC plat
  class T1,T2,T3,T4 team`,
      answer: `<p>Treat the framework as an internal product:</p>
<ul>
<li><strong>Core library as npm package</strong> — versioned, semver, changelog.</li>
<li><strong>Per-team test repos</strong> — they own tests, platform team owns core.</li>
<li><strong>Shared CI templates</strong> — reusable GH Actions/Jenkins.</li>
<li><strong>Plugin model</strong> — extend without forking.</li>
<li><strong>Documentation site</strong> — Docusaurus with examples and migrations.</li>
<li><strong>Contributor guidelines</strong> — RFC for breaking changes.</li>
<li><strong>Office hours</strong> — platform team unblocks teams.</li>
</ul>
<p>Hard part isn't technical — it's organizational. Who pages who at 2am when framework breaks?</p>`
    },
    {
      id: "3d6c91ae-8e1e-4c33-8cae-415debf5f836",
      q: "What are common test data management strategies and their trade-offs?",
      diff: "hard",
      tags: ["data", "architecture"],
      answer: `<table style="width:100%; font-size:13px; border-collapse: collapse;">
<tr><th style="text-align:left; padding:6px;">Strategy</th><th style="text-align:left; padding:6px;">Pro</th><th style="text-align:left; padding:6px;">Con</th></tr>
<tr><td style="padding:6px;">Static fixtures (JSON files)</td><td>Simple</td><td>Brittle, doesn't scale, drift over time</td></tr>
<tr><td style="padding:6px;">Factories (e.g. Fishery)</td><td>Flexible, composable</td><td>Setup boilerplate</td></tr>
<tr><td style="padding:6px;">API-based seeding</td><td>Realistic, exercises real code paths</td><td>Slower, depends on backend</td></tr>
<tr><td style="padding:6px;">DB seed scripts</td><td>Fast bulk setup</td><td>Skips business logic, can drift from API</td></tr>
<tr><td style="padding:6px;">Snapshot/restore</td><td>Reproducible, fast</td><td>Maintenance overhead, stale snapshots</td></tr>
</table>
<p><strong>Senior choice:</strong> factories + API-based seeding for most tests. Snapshots only for very expensive setups. Avoid static fixtures beyond simple lookup data.</p>`
    },
    {
      id: "c12f23aa-4ac5-4dc9-b20e-87e247b8ce1b",
      q: "How do you structure tests for a large monorepo with multiple apps?",
      diff: "hard",
      tags: ["architecture", "monorepo"],
      answer: `<pre class="code"><code>monorepo/
├── apps/
│   ├── web/
│   │   └── e2e/         # web-specific E2E tests
│   ├── admin/
│   │   └── e2e/         # admin-specific
├── packages/
│   ├── ui/
│   │   └── tests/       # component tests
│   └── api-client/
│       └── tests/       # unit + contract tests
├── e2e/                 # cross-app journeys (rare)
├── tools/
│   └── test-utils/      # shared test utilities
└── playwright.config.ts</code></pre>
<p><strong>Principles:</strong></p>
<ul>
<li>Tests live near the code they test.</li>
<li>Shared utilities in <code>tools/</code>, imported via workspace package references.</li>
<li>Cross-app tests only for genuine journeys spanning apps.</li>
<li>Use Nx or Turborepo to run only affected tests on PR.</li>
</ul>`
    },
    {
      id: "e27d348a-c767-41bd-8d24-c5ca6d7f29a3",
      q: "What is the Builder pattern in test code? When is it useful?",
      diff: "mid",
      tags: ["patterns", "data"],
      answer: `<pre class="code"><code>class OrderBuilder {
  private order: Partial&lt;Order&gt; = {
    status: 'pending',
    currency: 'EUR',
    items: [],
  };

  withCustomer(customerId: string): this {
    this.order.customerId = customerId;
    return this;
  }
  withItem(sku: string, qty = 1): this {
    this.order.items!.push({ sku, qty });
    return this;
  }
  expired(): this {
    this.order.status = 'expired';
    return this;
  }
  build(): Order { return this.order as Order; }
}

// Usage
const order = new OrderBuilder()
  .withCustomer('cust-123')
  .withItem('SKU-001', 2)
  .expired()
  .build();</code></pre>
<p>Useful when test data has many optional fields and combinations. Reads like English. Compare to a 12-arg constructor or a giant options object.</p>`
    },
  ]
};

export const PART_2_CATEGORIES: Category[] = [sql, frameworkArch];
