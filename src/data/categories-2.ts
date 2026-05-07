import type { Category } from "../types";

const sql: Category = {
  id: "sql",
  label: "SQL fundamentals",
  desc: "Joins, indexes, query plans, data integrity for QA validation",
  questions: [
    {
      q: "Explain INNER, LEFT, RIGHT, and FULL OUTER JOIN. When does QA use each?",
      diff: "easy",
      tags: ["sql", "joins"],
      answer: `<ul>
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
      q: "Primary key vs. foreign key vs. unique constraint?",
      diff: "easy",
      tags: ["sql", "schema"],
      answer: `<ul>
<li><strong>PRIMARY KEY</strong> — unique row identifier. NOT NULL + UNIQUE. One per table. Backed by clustered index.</li>
<li><strong>FOREIGN KEY</strong> — references PK of another table. Enforces referential integrity.</li>
<li><strong>UNIQUE</strong> — column(s) must be unique, can be nullable, multiple per table.</li>
</ul>
<p>Test: delete a user with orders. <code>ON DELETE RESTRICT</code> fails the operation. <code>ON DELETE CASCADE</code> deletes orders too. Schema behavior here is critical for data tests.</p>`
    },
    {
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
      q: "What is an index? When does it help, when does it hurt?",
      diff: "mid",
      tags: ["sql", "performance"],
      answer: `<p>B-tree (typically) data structure that lets the DB find rows without a full scan.</p>
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
      q: "What is EXPLAIN? Walk through diagnosing a slow query.",
      diff: "hard",
      tags: ["sql", "performance"],
      answer: `<p><code>EXPLAIN</code> shows the planner's strategy: indexes used, join algorithms, estimated row counts.</p>
<ol>
<li><code>EXPLAIN ANALYZE</code> (Postgres) or <code>EXPLAIN FORMAT=JSON</code> (MySQL) for actual times.</li>
<li>Look for <strong>Seq Scan / Full Table Scan</strong> on big tables — should be Index Scan.</li>
<li>Estimated vs actual rows. Big mismatch = stale stats; run <code>ANALYZE</code>.</li>
<li><strong>Nested loop joins on large tables</strong> usually want hash join.</li>
<li>Sort operations spilling to disk = slow.</li>
<li>Filter selectivity — is index actually useful?</li>
</ol>
<p>Common fix: composite index matching WHERE/ORDER BY columns in correct order.</p>`
    },
    {
      q: "WHERE vs. HAVING?",
      diff: "easy",
      tags: ["sql"],
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
      q: "What is a transaction? Explain ACID.",
      diff: "mid",
      tags: ["sql", "transactions"],
      answer: `<ul>
<li><strong>Atomicity</strong> — all-or-nothing. Failure rolls back everything.</li>
<li><strong>Consistency</strong> — moves from valid state to valid state. Constraints hold.</li>
<li><strong>Isolation</strong> — concurrent transactions don't interfere. Levels: READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE.</li>
<li><strong>Durability</strong> — once committed, survives crashes.</li>
</ul>
<p>Test: deduct money from A, add to B. If second step fails, both must roll back. A test asserting only step 2 misses the atomicity check.</p>`
    },
    {
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
      q: "How do NULLs behave in SQL? List 3 gotchas.",
      diff: "mid",
      tags: ["sql"],
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
      q: "What is a window function? Show one in use.",
      diff: "hard",
      tags: ["sql"],
      answer: `<p>Window functions compute a value for each row using a "window" of related rows — without collapsing rows like GROUP BY does.</p>
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
      q: "What is an n+1 query problem and how do you detect it?",
      diff: "hard",
      tags: ["sql", "performance"],
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
      q: "How do you write a query to find the top 3 best-selling products per category?",
      diff: "hard",
      tags: ["sql", "queries"],
      answer: `<p>Classic "top N per group" — window function is the cleanest.</p>
<pre class="code"><code>SELECT category_id, product_id, total_sold
FROM (
  SELECT
    p.category_id,
    p.id AS product_id,
    SUM(oi.quantity) AS total_sold,
    ROW_NUMBER() OVER (
      PARTITION BY p.category_id
      ORDER BY SUM(oi.quantity) DESC
    ) AS rnk
  FROM products p
  JOIN order_items oi ON oi.product_id = p.id
  GROUP BY p.category_id, p.id
) ranked
WHERE rnk &lt;= 3;</code></pre>
<p>Senior nuance: <code>ROW_NUMBER</code> assigns unique ranks (1, 2, 3, 4…) — ties broken arbitrarily. <code>DENSE_RANK</code> handles ties (1, 2, 2, 3). <code>RANK</code> skips after ties (1, 2, 2, 4). Choose based on whether ties should fit in the top 3.</p>`
    },
    {
      q: "Difference between a clustered and non-clustered index?",
      diff: "mid",
      tags: ["sql", "indexes"],
      answer: `<ul>
<li><strong>Clustered index</strong> — defines the physical storage order of the table. One per table (typically the primary key). Lookups by clustered key are fastest because data is right there.</li>
<li><strong>Non-clustered index</strong> — separate structure with pointers to the table rows. Many per table. Lookups require an extra "key lookup" step to fetch full row data, unless the index is "covering" (includes all needed columns).</li>
</ul>
<p>Trade-off: more non-clustered indexes = faster reads on those columns, slower writes (every INSERT/UPDATE updates all indexes). The covering index pattern (<code>INCLUDE</code> in SQL Server) avoids the lookup step.</p>`
    },
    {
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
      q: "Walk through the folder structure of a senior-grade Playwright + TS framework.",
      diff: "mid",
      tags: ["architecture"],
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
      q: "What is POM and what's a common anti-pattern?",
      diff: "mid",
      tags: ["pom"],
      answer: `<p>POM encapsulates UI interaction in classes — one per page or major component.</p>
<p><strong>Anti-patterns:</strong></p>
<ul>
<li><strong>Methods mirroring selectors</strong> — <code>clickSubmitButton()</code> bad, <code>placeOrder()</code> good.</li>
<li><strong>Returning Locators from public methods</strong> — leaks internals, breaks encapsulation.</li>
<li><strong>Assertions in POM</strong> — controversial. Playwright team says assertions belong in tests; precondition assertions in POM are defensible.</li>
<li><strong>Inheritance 5 levels deep</strong> — composition over inheritance. BasePage is fine; AbstractFooBarBasePage is not.</li>
</ul>
<p>Modern alternative: <strong>Feature Object</strong> — organize by user-facing feature, often better for SPAs.</p>`
    },
    {
      q: "Fixture composition pattern — why does it matter at scale?",
      diff: "hard",
      tags: ["fixtures", "architecture"],
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
      q: "How do you decide between E2E, integration, and unit tests?",
      diff: "hard",
      tags: ["strategy", "pyramid"],
      answer: `<ul>
<li><strong>Unit</strong> — pure logic. Cart math, formatters, validators. Fast, deterministic, no I/O.</li>
<li><strong>Integration / component</strong> — module interaction. UI form with validation, API + DB.</li>
<li><strong>E2E</strong> — critical journeys. Login → browse → cart → checkout. Slow, expensive, full-stack proof.</li>
</ul>
<p><strong>Senior heuristic:</strong> "what's the cheapest test that gives me confidence?" Don't write E2E for date formatting. Don't write unit test for "the entire checkout flow".</p>`
    },
    {
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
      q: "What are the four planes of a scalable test framework?",
      diff: "hard",
      tags: ["architecture", "scale"],
      answer: `<ol>
<li><strong>Execution plane</strong> — workers, sharding, parallelism. How fast tests run.</li>
<li><strong>State plane</strong> — test data isolation, DB state. Without this, parallelism causes flakiness.</li>
<li><strong>Dependency plane</strong> — external services, rate limits, mocks.</li>
<li><strong>Observability plane</strong> — flakiness metrics, runtime trends, failure clustering.</li>
</ol>
<p>Most teams design only execution plane and wonder why their suite collapses at scale. The other three don't auto-emerge.</p>`
    },
    {
      q: "Architect a test framework shared across 4 product teams.",
      diff: "hard",
      tags: ["architecture", "scale"],
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
