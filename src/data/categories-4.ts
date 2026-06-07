import type { Category } from "../types";

// ─── TypeScript & Programming ────────────────────────────────────────────────

const typescriptProgramming: Category = {
  id: "typescript-programming",
  label: "TypeScript & Programming",
  desc: "Generics, utility types, design patterns, and async patterns for senior test engineers",
  questions: [
    {
      id: "a639acea-9191-462e-9d93-682c5f09283c",
      q: "Explain TypeScript generics with a real test utility example.",
      diff: "mid",
      tags: ["typescript", "generics"],
      answer: `<p>Generics let you write reusable code that stays type-safe without repeating yourself for every type.</p>
<pre class="code"><code>// Without generics — duplicated for every response shape
function parseOrderResponse(raw: unknown): Order { ... }
function parseUserResponse(raw: unknown): User { ... }

// With generics — one validator, type-safe for any shape
function parseResponse&lt;T&gt;(raw: unknown, schema: Schema&lt;T&gt;): T {
  const result = schema.safeParse(raw);
  if (!result.success) throw new Error(\`Schema mismatch: \${result.error}\`);
  return result.data;
}

// Usage
const order = parseResponse&lt;Order&gt;(await response.json(), orderSchema);
const user  = parseResponse&lt;User&gt;(await response.json(), userSchema);</code></pre>
<p>Senior use cases in test frameworks: generic fixture factories, typed API clients, type-safe data builders, generic retry wrappers. The goal is catching shape mismatches at compile time — not at runtime in a failing test at 2am.</p>`
    },
    {
      id: "d66cc335-486e-4a1a-ab39-38d73cf0d491",
      q: "What are TypeScript utility types and which do you use most in test code?",
      diff: "mid",
      tags: ["typescript", "utility-types"],
      answer: `<p>Utility types transform existing types without duplicating them. The most useful in test code:</p>
<pre class="code"><code>// Partial — all fields optional. Good for builder overrides.
type OrderOverride = Partial&lt;Order&gt;;

// Required — all fields required. Enforces complete data.
type CompleteUser = Required&lt;User&gt;;

// Pick — select specific fields for test fixtures.
type LoginData = Pick&lt;User, 'email' | 'password'&gt;;

// Omit — exclude server-generated fields from create payloads.
type CreateOrderPayload = Omit&lt;Order, 'id' | 'createdAt'&gt;;

// Record — typed maps. Great for test seed data by scenario.
const seeds: Record&lt;'admin' | 'viewer' | 'guest', User&gt; = { ... };

// ReturnType — derive return type from a function.
type FixtureResult = ReturnType&lt;typeof buildOrderFixture&gt;;

// Parameters — derive param types from a function.
type BuilderArgs = Parameters&lt;typeof OrderBuilder.create&gt;[0];</code></pre>
<p><strong>Most valuable in practice:</strong> <code>Partial</code> for builder overrides, <code>Omit</code> for create payloads, <code>Record</code> for typed seed maps. Avoids maintaining parallel type definitions that silently drift from each other.</p>`
    },
    {
      id: "c61046ea-c6ff-4d08-b5ba-e2d5d4a2379c",
      q: "Interface vs. type alias — when do you pick each in test code?",
      diff: "mid",
      tags: ["typescript"],
      answer: `<p>Both define shapes but with key differences in capabilities and intent.</p>
<pre class="code"><code>// Interface — use for object shapes that may be extended or implemented
interface BasePage {
  goto(url: string): Promise&lt;void&gt;;
}
interface AdminPage extends BasePage {
  impersonateUser(id: string): Promise&lt;void&gt;;
}

// Type — use for unions, intersections, and computed shapes
type DiffFilter    = 'easy' | 'mid' | 'hard' | 'all';
type AuthedFixture = BaseFixture &amp; { token: string };
type PageOrNull    = Page | null;
type MaybeArray&lt;T&gt; = T | T[];</code></pre>
<p><strong>Rule of thumb for test code:</strong></p>
<ul>
<li>Use <strong>interface</strong> for Page Objects, fixture types, API client contracts — they are extended across the project.</li>
<li>Use <strong>type</strong> for unions (difficulty levels, test states), intersections (composed fixture types), and any computed or conditional types.</li>
</ul>
<p>Mixed usage within similar concepts is the real smell. Pick one approach per category of thing and be consistent across the framework.</p>`
    },
    {
      id: "df26c997-5663-4cd7-9e06-160de1cb441b",
      q: "What is a discriminated union and how do you use one in a test framework?",
      diff: "hard",
      tags: ["typescript", "patterns"],
      diagram: `graph TB
  UNION["APIResult&lt;T&gt;<br/>(discriminated by 'status')"]
  UNION --> OK["status: 'ok'<br/>data: T"]
  UNION --> ERR["status: 'error'<br/>message: string<br/>code: number"]
  UNION --> LOAD["status: 'loading'<br/>(no extra fields)"]
  CHECK["if (result.status === 'ok')"] -.narrows.-> OK
  CHECK2["if (result.status === 'error')"] -.narrows.-> ERR
  classDef ok fill:#2a9d8f,color:#fff
  classDef err fill:#e76f51,color:#fff
  classDef load fill:#e9c46a,color:#222
  class OK ok
  class ERR err
  class LOAD load`,
      answer: `<p>A discriminated union is a union of types sharing a common literal field (the discriminant). TypeScript narrows the type based on that field — no casts needed.</p>
<pre class="code"><code>type APIResult&lt;T&gt; =
  | { status: 'ok';      data: T             }
  | { status: 'error';   message: string; code: number }
  | { status: 'loading'                      };

function assertSuccess&lt;T&gt;(result: APIResult&lt;T&gt;): T {
  if (result.status !== 'ok') {
    throw new Error(\`Expected ok, got \${result.status}: \${
      result.status === 'error' ? result.message : 'loading'
    }\`);
  }
  return result.data; // TypeScript knows this is T here — no cast
}

// In tests
const result = await apiClient.getOrder('ord-123');
const order  = assertSuccess(result); // type: Order, fully inferred</code></pre>
<p>Useful in test frameworks for: typed test step results, fixture states (created/failed/torn-down), mock response builders where each HTTP status variant has different fields. Eliminates optional fields that only apply to some cases and the runtime errors they cause.</p>`
    },
    {
      id: "902e9e36-dce2-44d0-b2e2-0ffa19778b03",
      q: "How do you type an API response safely without using 'any'?",
      diff: "hard",
      tags: ["typescript", "api", "schema"],
      answer: `<p>Three layers working together: runtime validation, type inference, and strict assertion.</p>
<pre class="code"><code>import { z } from 'zod';

// 1. Define schema — single source of truth for type AND validation
const OrderSchema = z.object({
  id:       z.string().uuid(),
  total:    z.number().positive(),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  items:    z.array(z.object({
    sku: z.string(),
    qty: z.number().int().min(1),
  })).min(1),
});

type Order = z.infer&lt;typeof OrderSchema&gt;; // type derived from schema

// 2. Parse — validates AND types in one step, throws on mismatch
async function fetchOrder(id: string): Promise&lt;Order&gt; {
  const raw = await fetch(\`/api/orders/\${id}\`).then(r =&gt; r.json());
  return OrderSchema.parse(raw);
}

// 3. In tests — type-safe, descriptive error on mismatch
const order = await fetchOrder('ord-123');
expect(order.currency).toBe('EUR'); // TypeScript knows currency is the enum</code></pre>
<p>Without this: <code>any</code> casts accept wrong shapes silently, breaking at runtime in CI rather than at compile time on your machine. Zod schemas also serve as living documentation of what the API must return.</p>`
    },
    {
      id: "be699df3-c26a-4de9-a426-3e4f72edfccb",
      q: "Explain Promise.all vs Promise.allSettled — when does each matter in tests?",
      diff: "mid",
      tags: ["typescript", "async"],
      answer: `<pre class="code"><code>// Promise.all — fails fast on first rejection
// Use when ALL must succeed to continue (test setup)
const [order, user, inventory] = await Promise.all([
  apiClient.getOrder(id),
  apiClient.getUser(userId),
  apiClient.checkInventory(sku),
]);
// If any fails, the test throws immediately — correct for arrange phase

// Promise.allSettled — waits for ALL, collects every result
// Use in teardown — clean up as much as possible, don't hide the test failure
const results = await Promise.allSettled([
  db.delete(orderId),
  db.delete(userId),
  cache.flush(sessionKey),
]);
const failed = results.filter(r =&gt; r.status === 'rejected');
if (failed.length) console.warn('Teardown incomplete:', failed);
// Don't re-throw — would mask the actual test failure</code></pre>
<p><strong>Rule:</strong> <code>Promise.all</code> in arrange/act — all preconditions must hold. <code>Promise.allSettled</code> in teardown — clean up everything regardless of failures, never let teardown errors shadow test failures.</p>`
    },
    {
      id: "de1e684c-c173-4ad0-845e-314e88c0662e",
      q: "Write a type guard for an API error response.",
      diff: "mid",
      tags: ["typescript", "patterns"],
      answer: `<p>A type guard is a function returning <code>value is Type</code>. TypeScript narrows the type in the true branch without any cast.</p>
<div class="code-walk">
<pre class="code"><code>interface APIError {
  error:    string;
  code:     number;
  details?: string[];
}

function isAPIError(value: unknown): value is APIError {                  // ①
  return (
    typeof value === 'object' &amp;&amp;                                       // ②
    value !== null &amp;&amp;                                                  // ③
    'error' in value &amp;&amp;
    typeof (value as Record&lt;string, unknown&gt;).error === 'string' &amp;&amp;     // ④
    'code' in value &amp;&amp;
    typeof (value as Record&lt;string, unknown&gt;).code === 'number'
  );
}

const body = await response.json();                                       // ⑤
if (isAPIError(body)) {
  expect(body.code).toBe(422);                                            // ⑥
  expect(body.error).toContain('validation');
} else {
  throw new Error(\`Expected API error, got: \${JSON.stringify(body)}\`);
}</code></pre>
<ol class="code-walk-notes">
  <li><span class="cw-num">1</span><span><code>value is APIError</code> is the predicate signature. If this returns true, TS treats <code>value</code> as <code>APIError</code> in the true branch — no cast needed.</span></li>
  <li><span class="cw-num">2</span><span><code>typeof value === 'object'</code> excludes primitives but, crucially, NOT <code>null</code> — see next line.</span></li>
  <li><span class="cw-num">3</span><span>The classic JS gotcha: <code>typeof null === 'object'</code>. Without this null check, <code>'error' in value</code> on the next line throws.</span></li>
  <li><span class="cw-num">4</span><span>Each property checked for presence AND type. <code>'error' in value</code> on its own would accept <code>{ error: 123 }</code> — that's not an API error, it's a malformed body.</span></li>
  <li><span class="cw-num">5</span><span><code>response.json()</code> returns <code>unknown</code> in strict mode (or should — see Zod for runtime validation). The guard is what makes it safe to use.</span></li>
  <li><span class="cw-num">6</span><span>Inside the <code>if</code> block, <code>body.code</code> is typed as <code>number</code>. No casts, full autocomplete, and refactor-safe.</span></li>
</ol>
</div>
<p>Better than casting (<code>body as APIError</code>) — casting silently accepts wrong shapes. Type guards fail explicitly at runtime with a clear message, and they compose into reusable assertion helpers.</p>`
    },
    {
      id: "6e7e9b15-20c6-4906-a43d-b95dec073894",
      q: "How do you write a generic, type-safe data factory for test fixtures?",
      diff: "hard",
      tags: ["typescript", "patterns", "data"],
      answer: `<div class="code-walk">
<pre class="code"><code>type Factory&lt;T&gt; = {                                                    // ①
  build(overrides?: Partial&lt;T&gt;): T;
  buildList(count: number, overrides?: Partial&lt;T&gt;): T[];
};

function createFactory&lt;T&gt;(defaults: () =&gt; T): Factory&lt;T&gt; {              // ②
  return {
    build(overrides = {}) {
      return { ...defaults(), ...overrides };                          // ③
    },
    buildList(count, overrides = {}) {
      return Array.from({ length: count }, () =&gt; this.build(overrides));
    },
  };
}

const userFactory = createFactory&lt;User&gt;(() =&gt; ({                       // ④
  id:       crypto.randomUUID(),
  email:    \`user-\${Date.now()}@test.com\`,
  role:     'viewer',
  verified: true,
}));

const admin      = userFactory.build({ role: 'admin' });               // ⑤
const users      = userFactory.buildList(5);
const unverified = userFactory.build({ verified: false });</code></pre>
<ol class="code-walk-notes">
  <li><span class="cw-num">1</span><span><code>Factory&lt;T&gt;</code> is the public surface — two methods. Generic <code>T</code> means each entity gets its own typed factory.</span></li>
  <li><span class="cw-num">2</span><span><code>defaults: () =&gt; T</code> is a function, not an object. Critical: see ③.</span></li>
  <li><span class="cw-num">3</span><span>Calling <code>defaults()</code> on every <code>build()</code> creates fresh defaults. If you passed an object literal instead, all tests would share the same <code>id</code> — collisions when workers > 1.</span></li>
  <li><span class="cw-num">4</span><span><code>createFactory&lt;User&gt;</code> binds the generic. Now overrides must match the <code>User</code> shape — typos in field names become compile errors.</span></li>
  <li><span class="cw-num">5</span><span><code>Partial&lt;T&gt;</code> means only valid fields can be overridden. <code>{ admin: true }</code> would fail compilation. The defaults take care of the rest.</span></li>
</ol>
</div>
<p>This pattern beats hand-written test data: type-safe, refactor-safe (rename a field on <code>User</code> → factory still compiles), and produces fresh data per test by construction.</p>`
    },
    {
      id: "180f222d-645a-42a8-a024-8a1ac04d1758",
      q: "What is module augmentation and how does Playwright use it for custom fixtures?",
      diff: "hard",
      tags: ["typescript", "playwright", "fixtures"],
      answer: `<p>Module augmentation adds types to an existing module without forking it. Playwright's <code>test.extend()</code> uses it to make your custom fixtures fully typed throughout the project.</p>
<pre class="code"><code>// fixtures/index.ts
import { test as base } from '@playwright/test';
import { CheckoutPage } from '../pages/CheckoutPage';
import { APIClient }    from '../api/APIClient';

type CustomFixtures = {
  checkoutPage: CheckoutPage;
  apiClient:    APIClient;
  testUser:     { id: string; email: string };
};

export const test = base.extend&lt;CustomFixtures&gt;({
  checkoutPage: async ({ page }, use) =&gt; {
    await use(new CheckoutPage(page));
  },
  apiClient: async ({ request }, use) =&gt; {
    const client = new APIClient(request);
    await client.authenticate();
    await use(client);
    await client.cleanup();         // always runs, even on failure
  },
  testUser: async ({ apiClient }, use) =&gt; {
    const user = await apiClient.createUser();
    await use(user);
    await apiClient.deleteUser(user.id);
  },
});

export { expect } from '@playwright/test';</code></pre>
<p>Result: every test file imports <code>{ test }</code> from this fixture module. The params <code>{ checkoutPage, apiClient, testUser }</code> are fully typed — autocomplete, rename refactoring, compile-time errors on typos. No casts, no <code>any</code>.</p>`
    },
    {
      id: "72fdf060-e0a3-4e5b-a9d8-bb72f12779d2",
      q: "Explain the Strategy pattern with a test framework example.",
      diff: "hard",
      tags: ["typescript", "patterns", "architecture"],
      answer: `<p>Strategy defines a family of algorithms behind a common interface, making them interchangeable at runtime without changing the caller.</p>
<pre class="code"><code>interface AuthStrategy {
  authenticate(page: Page): Promise&lt;void&gt;;
}

// Strategy A — full UI login, tests the login flow itself
class UIAuthStrategy implements AuthStrategy {
  constructor(private creds: Credentials) {}
  async authenticate(page: Page) {
    await page.goto('/login');
    await page.getByLabel('Email').fill(this.creds.email);
    await page.getByLabel('Password').fill(this.creds.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');
  }
}

// Strategy B — API token injection, 200ms vs 5s
class APIAuthStrategy implements AuthStrategy {
  constructor(private creds: Credentials) {}
  async authenticate(page: Page) {
    const token = await mintTokenViaAPI(this.creds);
    await page.context().addCookies([{ name: 'auth', value: token, domain: 'localhost' }]);
  }
}

// Fixture selects strategy — swap without touching tests
const authStrategy: AuthStrategy = process.env.FAST_AUTH
  ? new APIAuthStrategy(creds)
  : new UIAuthStrategy(creds);

await authStrategy.authenticate(page);</code></pre>
<p>Other uses: report formatters, seed strategies (API vs DB direct), notification dispatchers. Adding a new strategy = one new class, zero changes to consumers.</p>`
    },
    {
      id: "41b017fa-effd-4651-b127-064f4ef958a6",
      q: "What is the difference between map, filter, and reduce — show each used in test data manipulation.",
      diff: "easy",
      tags: ["typescript", "programming"],
      answer: `<pre class="code"><code>const orders: Order[] = await apiClient.getAllOrders();

// map — transform each element, preserves count
const orderIds  = orders.map(o =&gt; o.id);
const summaries = orders.map(o =&gt; ({ id: o.id, total: o.total }));

// filter — keep matching elements, reduces count
const shipped   = orders.filter(o =&gt; o.status === 'shipped');
const highValue = orders.filter(o =&gt; o.total &gt; 1000);

// reduce — aggregate to one value
const grandTotal = orders.reduce((sum, o) =&gt; sum + o.total, 0);

// Group by status — reduce to a map
const byStatus = orders.reduce&lt;Record&lt;string, Order[]&gt;&gt;((acc, o) =&gt; {
  (acc[o.status] ??= []).push(o);
  return acc;
}, {});

// Chain them — readable, no mutation
const shippedTotal = orders
  .filter(o =&gt; o.status === 'shipped')
  .map(o =&gt; o.total)
  .reduce((sum, t) =&gt; sum + t, 0);</code></pre>
<p>Used constantly for: transforming API responses into assertion inputs, grouping test results by category, computing expected aggregates to compare against database totals. All three are pure — no mutation, safe across parallel workers.</p>`
    },
    {
      id: "1879f346-7b12-474c-a4b9-ba3112b12a36",
      q: "How do optional chaining and nullish coalescing interact with test assertions?",
      diff: "easy",
      tags: ["typescript"],
      answer: `<pre class="code"><code>// Optional chaining — avoids TypeError on missing nested props
const city = user?.address?.city;       // undefined if any part is null
const tag  = order?.items?.[0]?.tag;

// Nullish coalescing — default only for null/undefined (not 0 or '')
const label  = category?.label  ?? 'Unknown';
const count  = result?.count    ?? 0;
const status = response?.status ?? 500;

// ❌ The trap: optional chaining in assertions silently passes
expect(order?.total).toBeGreaterThan(0);
// If order is null, order?.total is undefined — some matchers pass on undefined!

// ✅ Assert existence first, then assert the property
expect(order).not.toBeNull();
expect(order!.total).toBeGreaterThan(0);

// ✅ Or use a helper that fails loudly
function defined&lt;T&gt;(value: T | null | undefined, label: string): T {
  if (value == null) throw new Error(\`Expected \${label} to be defined\`);
  return value;
}
const total = defined(order, 'order').total;
expect(total).toBeGreaterThan(0);</code></pre>
<p><strong>Rule:</strong> never use <code>?.</code> inside <code>expect()</code>. It turns missing values into <code>undefined</code> and some matchers accept that, producing a test that passes when the data is completely absent.</p>`
    },
    {
      id: "2daa11d5-8ca3-41e7-8041-7ff0f0626b15",
      q: "Walk through the event loop. In what order does this code print?",
      diff: "hard",
      tags: ["javascript", "async"],
      diagram: `graph LR
  STACK["Call stack<br/>(sync code)"] -->|"empty"| MICRO["Microtask queue<br/>Promise.then, queueMicrotask, await"]
  MICRO -->|"drain ALL<br/>before next macro"| MACRO["Macrotask queue<br/>setTimeout, setInterval, I/O"]
  MACRO -->|"pick one"| STACK
  RENDER["Browser render<br/>(between macrotasks)"] -.-> MACRO`,
      answer: `<pre class="code"><code>console.log('1');
setTimeout(() =&gt; console.log('2'), 0);
Promise.resolve().then(() =&gt; console.log('3'));
queueMicrotask(() =&gt; console.log('4'));
console.log('5');</code></pre>
<p><strong>Output: 1, 5, 3, 4, 2</strong></p>
<ol>
<li><strong>Synchronous code first</strong>: <code>1</code>, <code>5</code> print immediately.</li>
<li><strong>Microtasks drain next</strong>: <code>3</code> (Promise.then) and <code>4</code> (queueMicrotask) run before any macrotask. They run in order queued.</li>
<li><strong>Macrotasks (timers, I/O) last</strong>: <code>2</code> prints after the microtask queue is empty.</li>
</ol>
<p>Key rules:</p>
<ul>
<li>After each macrotask, the engine drains the <em>entire</em> microtask queue before picking the next macrotask.</li>
<li><code>setTimeout(fn, 0)</code> is not 0ms — it's "as soon as the microtask queue is empty and we're on a fresh tick" (minimum ~4ms in many browsers).</li>
<li><code>await</code> is sugar for a Promise microtask — code after <code>await</code> runs as a microtask.</li>
<li>Tests that use <code>setTimeout(0)</code> to "let React render" are racing — use <code>Promise.resolve()</code> or framework-specific <code>act()</code>/<code>flushSync()</code>.</li>
</ul>`,
    },
    {
      id: "d7978698-c92e-41ed-8095-f8861f4d3408",
      q: "Implement retry with exponential backoff and jitter.",
      diff: "hard",
      tags: ["javascript", "async", "qa"],
      diagram: `flowchart TD
  START["Call fn()"] --> TRY{"Success?"}
  TRY -->|yes| OK["return result"]
  TRY -->|no| RETRYABLE{"Retryable error?<br/>(network / 5xx, NOT 4xx)"}
  RETRYABLE -->|no| FAIL["throw immediately"]
  RETRYABLE -->|yes| MAX{"attempts left?"}
  MAX -->|no| FAIL
  MAX -->|yes| WAIT["wait: base * 2^n<br/>+ random jitter"]
  WAIT --> START`,
      answer: `<p>The senior version handles: backoff growth, max retries, jitter (to avoid thundering herds), and a predicate that decides which errors are retryable.</p>
<pre class="code"><code>interface RetryOpts {
  attempts?: number;       // default 3
  baseMs?: number;         // default 200
  maxMs?: number;          // cap on each delay (default 5000)
  shouldRetry?: (err: unknown) =&gt; boolean;
}

async function retry&lt;T&gt;(fn: () =&gt; Promise&lt;T&gt;, opts: RetryOpts = {}): Promise&lt;T&gt; {
  const { attempts = 3, baseMs = 200, maxMs = 5000, shouldRetry = () =&gt; true } = opts;
  let lastErr: unknown;
  for (let i = 0; i &lt; attempts; i++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      if (i === attempts - 1 || !shouldRetry(err)) break;
      const exp = Math.min(baseMs * 2 ** i, maxMs);
      const jitter = Math.random() * exp * 0.3;     // ±30% jitter
      await new Promise(r =&gt; setTimeout(r, exp + jitter));
    }
  }
  throw lastErr;
}

// Use it
const order = await retry(() =&gt; fetchOrder(id), {
  attempts: 5,
  shouldRetry: e =&gt; e instanceof NetworkError || (e as any)?.status &gt;= 500,
});</code></pre>
<p><strong>Why jitter:</strong> if 1000 clients all retry after a deterministic 1s, they all hit the failing server at once. Jitter spreads the load.</p>
<p><strong>QA angle:</strong> don't blanket-retry tests. Retrying tests masks flakiness. Retry network operations <em>inside</em> the test (real-world resilience) but assert pass/fail on a single run — that's how you find flakes.</p>`,
    },
  ],
};

// ─── GraphQL & Contract Testing ──────────────────────────────────────────────

const graphqlContracts: Category = {
  id: "graphql-contracts",
  label: "GraphQL & Contracts",
  desc: "GraphQL testing in depth and consumer-driven contract testing with Pact and OpenAPI",
  questions: [
    {
      id: "d8109e8f-a510-4ad2-811a-89f4cab4ba01",
      q: "How is testing a GraphQL API fundamentally different from testing REST?",
      diff: "mid",
      tags: ["graphql", "api"],
      diagram: `flowchart LR
  subgraph REST["REST"]
    R1["GET /orders/bad"] --> R2["HTTP 404"]
    R2 --> R3["test: expect(status).toBe(404) ✓"]
  end
  subgraph GQL["GraphQL"]
    G1["POST /graphql<br/>{ order(id: 'bad') }"] --> G2["HTTP 200 🚨"]
    G2 --> G3{"body.errors?"}
    G3 -- "✗ skipped" --> WRONG["test passes — bug ships"]
    G3 -- "✓ asserted" --> RIGHT["test fails as expected"]
  end
  classDef good fill:#2a9d8f,color:#fff
  classDef bad fill:#e76f51,color:#fff
  class R3,RIGHT good
  class WRONG bad`,
      answer: `<p>Five key differences every tester must internalise:</p>
<table style="width:100%; font-size:13px; border-collapse:collapse;">
<tr><th style="text-align:left;padding:6px;">Aspect</th><th style="text-align:left;padding:6px;">REST</th><th style="text-align:left;padding:6px;">GraphQL</th></tr>
<tr><td style="padding:6px;">Endpoints</td><td>Many — one per resource</td><td>Single — always <code>/graphql</code></td></tr>
<tr><td style="padding:6px;">HTTP status for errors</td><td>Meaningful (404, 422, 500)</td><td>Almost always 200</td></tr>
<tr><td style="padding:6px;">Error location</td><td>Response body + status code</td><td><code>errors[]</code> array in body</td></tr>
<tr><td style="padding:6px;">Response shape</td><td>Server-defined</td><td>Client-defined per query</td></tr>
<tr><td style="padding:6px;">Versioning</td><td><code>/v1/</code>, <code>/v2/</code></td><td>Schema deprecation, evolution</td></tr>
</table>
<p><strong>Most critical for testers:</strong> always check the <code>errors</code> array — a 200 OK does not mean the operation succeeded.</p>
<pre class="code"><code>const response = await request.post('/graphql', {
  data: { query: \`{ order(id: "bad-id") { id total } }\` },
});

expect(response.status()).toBe(200);          // always 200
const body = await response.json();
expect(body.errors).toBeUndefined();          // THIS is your real success check
expect(body.data.order).not.toBeNull();</code></pre>`
    },
    {
      id: "14d18859-1a7c-4ab5-a934-5de5ced444e2",
      q: "How do you test GraphQL mutations — what makes them different from queries?",
      diff: "mid",
      tags: ["graphql", "api"],
      diagram: `flowchart TD
  M["mutation createOrder(...)"] --> SEND["POST /graphql"]
  SEND --> R["HTTP 200"]
  R --> A1{"body.errors?"}
  A1 -- yes --> FAIL["fail test<br/>(validation, authz, server)"]
  A1 -- no --> A2["assert body.data.createOrder<br/>(id, status, items)"]
  A2 --> SIDE["⚠ side-effect check"]
  SIDE --> Q["GET /orders/{id}<br/>(separate query)"]
  Q --> PERS{"persisted?"}
  PERS -- yes --> PASS["✓ mutation truly succeeded"]
  PERS -- no --> BUG["bug: response lied"]
  classDef good fill:#2a9d8f,color:#fff
  classDef bad fill:#e76f51,color:#fff
  class PASS good
  class FAIL,BUG bad`,
      answer: `<pre class="code"><code>const CREATE_ORDER = \`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      total
      items { sku quantity }
    }
  }
\`;

const response = await request.post('/graphql', {
  data: {
    query: CREATE_ORDER,
    variables: { input: { sku: 'SKU-001', quantity: 2, currency: 'EUR' } },
  },
});

const body = await response.json();
expect(body.errors).toBeUndefined();
const order = body.data.createOrder;
expect(order.status).toBe('PENDING');
expect(order.items).toHaveLength(1);

// Always verify the side effect — don't trust just the response
const fetched = await apiClient.getOrder(order.id);
expect(fetched.status).toBe('PENDING'); // confirms it was actually persisted</code></pre>
<p><strong>Key differences from queries:</strong></p>
<ul>
<li>Mutations must be tested for side effects — the response alone is not proof the state changed.</li>
<li>Input validation errors land in <code>errors[]</code>, not in the status code.</li>
<li>Mutations are NOT idempotent by default — duplicate calls create duplicates unless you pass an idempotency key.</li>
<li>Authorization errors also return 200 with an error in the body.</li>
</ul>`
    },
    {
      id: "4d9b85a3-fa72-442e-84b2-5b1b1ba91f54",
      q: "How do you handle partial errors in a GraphQL response?",
      diff: "hard",
      tags: ["graphql", "api"],
      answer: `<p>GraphQL can return partial data — some fields resolve successfully, others fail. The response contains both <code>data</code> AND <code>errors</code> simultaneously.</p>
<pre class="code"><code>// Example partial response: user returned, orders field failed
{
  "data": {
    "user": {
      "id": "usr-123",
      "email": "user@test.com",
      "orders": null
    }
  },
  "errors": [{
    "message": "Orders service unavailable",
    "path": ["user", "orders"],
    "extensions": { "code": "SERVICE_UNAVAILABLE" }
  }]
}

// In tests — assert both sides explicitly
const body = await response.json();

// Partial success test
expect(body.data.user.email).toBe('user@test.com');
expect(body.data.user.orders).toBeNull();
expect(body.errors).toHaveLength(1);
expect(body.errors[0].path).toEqual(['user', 'orders']);
expect(body.errors[0].extensions.code).toBe('SERVICE_UNAVAILABLE');

// Full success test — no errors at all
expect(body.errors).toBeUndefined();</code></pre>
<p>The most common mistake: only asserting on <code>body.data</code> and ignoring <code>body.errors</code>. Tests pass green while the UI renders broken widgets. Always check both fields explicitly.</p>`
    },
    {
      id: "f58ea388-7683-47ca-93d1-c5f64b7abad0",
      q: "How do you use GraphQL schema introspection to drive test coverage?",
      diff: "hard",
      tags: ["graphql", "api"],
      answer: `<p>GraphQL exposes its own schema at runtime via introspection. Query it to discover all operations, types, and deprecations.</p>
<pre class="code"><code>const INTROSPECTION = \`
  query {
    __schema {
      queryType    { fields { name isDeprecated deprecationReason } }
      mutationType { fields { name isDeprecated deprecationReason } }
    }
  }
\`;

const response = await request.post('/graphql', { data: { query: INTROSPECTION } });
const schema   = (await response.json()).data.__schema;

// Warn on deprecated fields still in your test suite
const deprecated = schema.queryType.fields
  .filter(f =&gt; f.isDeprecated)
  .map(f =&gt; f.name);

console.log('Deprecated operations still in use:', deprecated);</code></pre>
<p><strong>Senior uses:</strong></p>
<ul>
<li><strong>Schema snapshot</strong> — save the SDL as a file, diff it on every CI run. Any field removal or type change fails CI and forces a deliberate review.</li>
<li><strong>Auto-generate stubs</strong> — enumerate all mutations from introspection and generate test skeletons for new ones.</li>
<li><strong>Deprecation tracking</strong> — detect when your tests reference fields the API team has flagged for removal.</li>
</ul>
<pre class="code"><code>// Schema snapshot test
test('schema has not changed unexpectedly', async () => {
  const sdl = await fetchSchemaSDL();
  expect(sdl).toMatchSnapshot(); // blocks any unreviewed change
});</code></pre>`
    },
    {
      id: "13645dd8-2296-4784-8e5b-e2cc883653a9",
      q: "Schema evolution in GraphQL — how do you test backward compatibility?",
      diff: "hard",
      tags: ["graphql", "contracts"],
      answer: `<p>GraphQL deprecates rather than versions. Adding fields is safe. Removing or renaming breaks existing clients silently.</p>
<pre class="code"><code># Safe change — additive only
type Order {
  id:          ID!
  total:       Float!
  status:      String! @deprecated(reason: "Use orderStatus")
  orderStatus: OrderStatus!       # new enum — added alongside old field
  estimatedDelivery: String       # new optional — safe
}

# Breaking change — never do this without a deprecation window
type Order {
  id:          ID!
  total:       Float!
  # status removed — all existing clients break immediately
  orderStatus: OrderStatus!
}</code></pre>
<pre class="code"><code>// Test: deprecated field still works during the window
test('status field returns value during deprecation period', async () => {
  const { data } = await graphqlQuery(\`{ order(id: "ord-1") { id status } }\`);
  expect(data.order.status).toBeDefined(); // must not break until officially removed
});

// Test: new field works
test('orderStatus returns typed enum value', async () => {
  const { data } = await graphqlQuery(\`{ order(id: "ord-1") { orderStatus } }\`);
  expect(['PENDING', 'SHIPPED', 'DELIVERED']).toContain(data.order.orderStatus);
});</code></pre>
<p><strong>Breaking changes checklist:</strong> removing a field, changing a type (String → Int), making a nullable field required, renaming an enum value, removing an enum value. Any of these fail existing clients unless caught by contract or snapshot tests.</p>`
    },
    {
      id: "e56a91ad-ed4f-432b-8e51-9be6e7d6fc83",
      q: "Walk through a complete Pact consumer test — what does it actually produce?",
      diff: "hard",
      tags: ["contracts", "pact", "api"],
      diagram: `sequenceDiagram
  participant T as Consumer test
  participant M as Pact mock server
  participant F as pacts/*.json
  participant B as Pact Broker
  participant P as Provider CI
  T->>M: describe expected req/res
  T->>M: actual API call
  M-->>T: stubbed response
  M->>F: write contract file
  F->>B: publish (on green)
  B->>P: pull latest contracts
  P->>P: replay against real code
  P->>B: verification result`,
      answer: `<p>Pact records your consumer's expectations as a contract file. The provider verifies those expectations against their real implementation. No shared test environment needed.</p>
<pre class="code"><code>// consumer.spec.ts — Order UI consuming Order API
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const provider = new PactV3({ consumer: 'OrderUI', provider: 'OrderAPI' });

it('returns an order by ID', async () =&gt; {
  await provider
    .given('order ord-123 exists')
    .uponReceiving('GET request for order ord-123')
    .withRequest({ method: 'GET', path: '/orders/ord-123' })
    .willRespondWith({
      status: 200,
      body: {
        id:     MatchersV3.uuid(),
        total:  MatchersV3.number(100),
        status: MatchersV3.string('shipped'),
      },
    });

  await provider.executeTest(async (mockServer) =&gt; {
    const client = new OrderAPIClient(mockServer.url);
    const order  = await client.getOrder('ord-123');
    expect(order.id).toBeDefined();
    expect(order.total).toBeGreaterThan(0);
  });
});
// Running this test writes: pacts/OrderUI-OrderAPI.json</code></pre>
<p>Pact spins up a local mock server, replays the expected interaction, records it as JSON. That file is published to Pact Broker. The provider pulls it and verifies against their real code. Consumer and provider never share an environment — the contract file is the handshake.</p>`
    },
    {
      id: "cd6fd9ea-edc3-4404-8012-f2d17d2b63d5",
      q: "Why must provider verification run in the provider's CI — not the consumer's?",
      diff: "hard",
      tags: ["contracts", "pact"],
      diagram: `flowchart LR
  subgraph CONS["Consumer repo (OrderUI)"]
    CTEST["consumer test<br/>vs Pact MOCK"]
    CTEST --> PACT["pact.json<br/>(my wishlist)"]
  end
  PACT --> BROKER[(Pact Broker)]
  subgraph PROV["Provider repo (OrderAPI) ⚡critical"]
    PCI["provider CI"]
    PVER["Verifier replays pact<br/>against REAL code + DB"]
    PCI --> PVER
  end
  BROKER --> PVER
  PVER --> RES{"matches?"}
  RES -- yes --> OK["✓ deploy allowed"]
  RES -- no --> BLOCK["✗ provider PR blocked<br/>consumer team notified"]
  classDef cons fill:#0a3d6e,color:#fff
  classDef prov fill:#2a9d8f,color:#fff
  classDef bad fill:#e76f51,color:#fff
  class CTEST,PACT cons
  class PCI,PVER,OK prov
  class BLOCK bad`,
      answer: `<p>This is the organizational rule that makes contract testing work. Without it the whole system is circular and useless.</p>
<p><strong>Consumer CI:</strong> generates the pact, runs against a mock. Always passes — the mock does whatever you told it to. The pact file is the consumer's wishlist.</p>
<p><strong>Provider CI:</strong> must verify the pact against the real implementation. This is where the contract earns its value.</p>
<pre class="code"><code>// provider.spec.ts — lives in the Order API repo
import { Verifier } from '@pact-foundation/pact';

test('verify consumer contracts', async () =&gt; {
  await new Verifier({
    provider:        'OrderAPI',
    providerBaseUrl: 'http://localhost:3000',
    pactBrokerUrl:   process.env.PACT_BROKER_URL,
    publishVerificationResult: true,
    providerVersion:           process.env.GIT_SHA,
    stateHandlers: {
      'order ord-123 exists': async () =&gt; {
        await db.seed({ id: 'ord-123', total: 100 });
      },
    },
  }).verifyProvider();
});</code></pre>
<p><strong>The failure scenario that proves value:</strong> API team renames <code>status</code> to <code>orderStatus</code>. Consumer tests still pass (against the old mock). Provider verification fails. The renaming PR is blocked. The consumer team is notified. That is the contract working exactly as designed.</p>`
    },
    {
      id: "39d22efc-1c40-4af0-b1d5-c90b060b6b58",
      q: "What is an OpenAPI contract and how do you validate API responses against it?",
      diff: "mid",
      tags: ["contracts", "api", "openapi"],
      diagram: `flowchart LR
  SPEC["openapi.yaml<br/>(source of truth)"] --> FE["frontend codegen<br/>typed client"]
  SPEC --> BE["backend validation<br/>request / response"]
  SPEC --> DOC["docs UI"]
  SPEC --> TST["test oracle<br/>Ajv / Schemathesis"]
  TST --> RUN["CI run"]
  RUN --> R{"response matches?"}
  R -- yes --> PASS["✓"]
  R -- no --> FAIL["✗ API drift<br/>caught before consumers"]
  classDef star fill:#0a3d6e,color:#fff
  classDef good fill:#2a9d8f,color:#fff
  classDef bad fill:#e76f51,color:#fff
  class SPEC star
  class PASS good
  class FAIL bad`,
      answer: `<p>An OpenAPI spec is a machine-readable description of your REST API — endpoints, schemas, status codes. It is the source of truth between frontend and backend and a ready-made test oracle.</p>
<pre class="code"><code># openapi.yaml (excerpt)
paths:
  /orders/{id}:
    get:
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '404':
          $ref: '#/components/responses/NotFound'</code></pre>
<pre class="code"><code>// Validate every response against the spec automatically
import Ajv from 'ajv';
import spec from './openapi.json';

test('GET /orders/:id response matches OpenAPI contract', async ({ request }) =&gt; {
  const response = await request.get('/orders/ord-123');
  const body     = await response.json();

  const schema    = spec.paths['/orders/{id}'].get.responses['200'];
  const validator = new Ajv().compile(schema);
  const valid     = validator(body);

  expect(validator.errors).toBeNull();
  expect(valid).toBe(true);
});</code></pre>
<p><strong>Tools that do this automatically:</strong> Schemathesis (auto-generates tests from the spec, finds edge cases), openapi-response-validator, Zod with zod-openapi. Run contract validation on every merge — catches API drift weeks before consumers notice.</p>`
    },
  ],
};

// ─── Project Structure & Conventions ────────────────────────────────────────

const projectStructure: Category = {
  id: "project-structure",
  label: "Project structure",
  desc: "File naming, folder layout, conventions, and configuration management for test frameworks",
  questions: [
    {
      id: "1611cb8a-85c4-4d0a-9548-72dfc5e66ff9",
      q: "What file naming convention should Playwright test files follow and why?",
      diff: "easy",
      tags: ["conventions", "architecture"],
      answer: `<p>Playwright defaults to <code>*.spec.ts</code> (<code>testMatch: '**/*.spec.ts'</code>). Each suffix carries a convention:</p>
<ul>
<li><code>checkout.spec.ts</code> — standard Playwright convention. Preferred.</li>
<li><code>checkout.test.ts</code> — used in unit/component test ecosystems (Jest, Vitest). Mixing with E2E creates confusion.</li>
<li><code>checkout.e2e.ts</code> — explicit E2E marker. Useful in monorepos where unit and E2E tests live in the same tree.</li>
</ul>
<pre class="code"><code>// ✅ Feature-based — clear scope, easy to find
tests/
  checkout/
    checkout-happy-path.spec.ts
    checkout-payment-errors.spec.ts
    checkout-accessibility.spec.ts
  auth/
    login.spec.ts
    password-reset.spec.ts
  api/
    orders-api.spec.ts

// ❌ Avoid
tests/
  test1.spec.ts                 // meaningless
  CheckoutTests.spec.ts         // PascalCase is not the file convention
  test-checkout.spec.ts         // redundant prefix</code></pre>
<p>Name files after the <strong>feature or user journey</strong>, not the component or class. Consistency within the project matters more than which convention you pick. Set <code>testDir</code> in <code>playwright.config.ts</code> to enforce the root.</p>`
    },
    {
      id: "cc0a0726-9daf-44d3-8d9a-c945e4be46c8",
      q: "What is a barrel file (index.ts) and when does it become harmful?",
      diff: "mid",
      tags: ["conventions", "typescript"],
      answer: `<p>A barrel file re-exports from multiple modules, collapsing import paths.</p>
<pre class="code"><code>// pages/index.ts — barrel
export { CheckoutPage }  from './CheckoutPage';
export { LoginPage }     from './LoginPage';
export { DashboardPage } from './DashboardPage';

// Without barrel — verbose
import { CheckoutPage } from '../pages/CheckoutPage';
import { LoginPage }    from '../pages/LoginPage';

// With barrel — clean
import { CheckoutPage, LoginPage } from '../pages';</code></pre>
<p><strong>When barrels become harmful:</strong></p>
<ul>
<li><strong>Circular imports</strong> — A imports from <code>index.ts</code> which re-exports B which imports A. Hard to debug, causes runtime errors.</li>
<li><strong>Slow test startup</strong> — Node loads the entire barrel even when you need one export. In large projects this adds meaningful seconds.</li>
<li><strong>False coupling</strong> — renaming one file requires updating the barrel, creating unnecessary churn.</li>
</ul>
<p><strong>Rule:</strong> one barrel per major folder (<code>pages/</code>, <code>api/</code>, <code>fixtures/</code>). No nested barrels. Skip the barrel in <code>utils/</code> unless the folder is very stable — utils tend to grow and barrel maintenance becomes a tax.</p>`
    },
    {
      id: "64bb5654-b09a-48ab-ab2b-b6cb2774d5c4",
      q: "How do you separate helpers, utilities, and fixtures — where does each live?",
      diff: "hard",
      tags: ["architecture", "conventions"],
      answer: `<p>Three different scopes of reuse, often conflated, with distinct homes:</p>
<table style="width:100%; font-size:13px; border-collapse:collapse;">
<tr><th style="padding:6px;">Type</th><th style="padding:6px;">What it is</th><th style="padding:6px;">Folder</th><th style="padding:6px;">Example</th></tr>
<tr><td style="padding:6px;"><strong>Fixture</strong></td><td style="padding:6px;">Playwright DI. Lifecycle — setup, use, teardown.</td><td style="padding:6px;"><code>fixtures/</code></td><td style="padding:6px;"><code>testUser</code>, <code>authedPage</code></td></tr>
<tr><td style="padding:6px;"><strong>Utility</strong></td><td style="padding:6px;">Pure function. No state, no browser, no lifecycle.</td><td style="padding:6px;"><code>utils/</code></td><td style="padding:6px;"><code>formatCurrency()</code>, <code>generateEmail()</code></td></tr>
<tr><td style="padding:6px;"><strong>Helper</strong></td><td style="padding:6px;">Browser-dependent logic. Not a full Page Object.</td><td style="padding:6px;"><code>helpers/</code></td><td style="padding:6px;"><code>waitForToast(page)</code>, <code>scrollToBottom(page)</code></td></tr>
</table>
<pre class="code"><code>project/
├── fixtures/       # Playwright fixtures — test.extend()
│   ├── auth.fixture.ts
│   ├── data.fixture.ts
│   └── index.ts            # composed export
├── utils/          # Pure functions — no Playwright import allowed here
│   ├── dates.ts
│   ├── random.ts
│   └── strings.ts
├── helpers/        # Browser helpers — accept Page/Locator as argument
│   ├── navigation.ts
│   └── assertions.ts
└── pages/          # Page Objects — classes wrapping a URL
    └── CheckoutPage.ts</code></pre>
<p>The diagnostic smell: a file in <code>utils/</code> that imports from <code>@playwright/test</code>. That is a helper or fixture, not a utility. Utils must be runnable in any Node context.</p>`
    },
    {
      id: "131f2197-22e0-46a2-837f-357a953e3cb5",
      q: "How do you manage per-environment configuration in a Playwright framework?",
      diff: "hard",
      tags: ["architecture", "configuration"],
      answer: `<pre class="code"><code>// config/env.ts — validate all env vars at startup, fail early
import { z } from 'zod';

const envSchema = z.object({
  BASE_URL:      z.string().url(),
  API_URL:       z.string().url(),
  USER_EMAIL:    z.string().email(),
  USER_PASSWORD: z.string().min(8),
  DB_URL:        z.string().optional(),
});

export const env = envSchema.parse(process.env);
// Throws immediately if anything is missing — clear message before any test runs

// playwright.config.ts
use: { baseURL: env.BASE_URL }

// .env.staging  — not committed
BASE_URL=https://staging.example.com
API_URL=https://api.staging.example.com
USER_EMAIL=qa-bot@staging.example.com

// .env.local     — not committed, personal overrides
BASE_URL=http://localhost:3000
API_URL=http://localhost:8080</code></pre>
<p><strong>Three things to never do:</strong></p>
<ul>
<li>Hardcode URLs in test files — they break on environment change.</li>
<li>Use raw <code>process.env.SOMETHING</code> without validation — fails mid-test with a cryptic <code>undefined is not a valid URL</code>.</li>
<li>Commit <code>.env</code> files with real credentials — add all <code>.env.*</code> variants to <code>.gitignore</code>.</li>
</ul>`
    },
    {
      id: "f1d3ce74-e1b1-4ba6-8fc2-e924fd73d735",
      q: "When should a Page Object be split into multiple files?",
      diff: "mid",
      tags: ["pom", "architecture"],
      answer: `<p>Split when a Page Object grows beyond one clear responsibility. Signals to watch for:</p>
<ul>
<li>File exceeds ~150–200 lines.</li>
<li>Multiple distinct workflows on the same URL (checkout has address, payment, summary, confirmation — each is a section).</li>
<li>Multiple roles interact with the same page differently.</li>
<li>Methods that are only used by a single test — shouldn't live in a shared POM at all.</li>
</ul>
<pre class="code"><code>// Before — one god class, 400 lines
class CheckoutPage { /* everything */ }

// After — composition by section
class CheckoutAddressSection {
  readonly firstName = this.page.getByLabel('First name');
  async fill(data: Address) { ... }
}
class CheckoutPaymentSection {
  readonly cardNumber = this.page.getByLabel('Card number');
  async fillCard(number: string) { ... }
}
class CheckoutConfirmationSection {
  readonly orderNumber = this.page.getByTestId('order-number');
}

class CheckoutPage {
  readonly address      = new CheckoutAddressSection(this.page);
  readonly payment      = new CheckoutPaymentSection(this.page);
  readonly confirmation = new CheckoutConfirmationSection(this.page);
  constructor(private page: Page) {}
}</code></pre>
<p>Tests read as: <code>await checkout.payment.fillCard('4242...')</code>. Each section file is independently reviewable and can be changed without touching the others.</p>`
    },
    {
      id: "3da7fe7b-7ab0-4585-a939-35ea59ab6016",
      q: "What does a well-structured tsconfig.json look like for a Playwright project?",
      diff: "mid",
      tags: ["typescript", "configuration"],
      answer: `<pre class="code"><code>// tsconfig.json — for test code
{
  "compilerOptions": {
    "target":             "ES2022",
    "module":             "CommonJS",
    "lib":                ["ES2022"],
    "strict":             true,
    "noUnusedLocals":     true,     // catches stale imports immediately
    "noUnusedParameters": true,
    "noImplicitReturns":  true,
    "esModuleInterop":    true,
    "resolveJsonModule":  true,
    "baseUrl":            ".",
    "paths": {
      "@fixtures/*": ["./fixtures/*"],
      "@pages/*":    ["./pages/*"],
      "@utils/*":    ["./utils/*"]
    }
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist", "playwright-report"]
}

// tsconfig.node.json — only for playwright.config.ts
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module":           "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["playwright.config.ts"]
}</code></pre>
<p><strong>Path aliases</strong> (<code>@fixtures/*</code>) eliminate <code>../../../fixtures/</code> crawling. <strong>Strict mode</strong> is non-negotiable — it catches the null dereferences and missing awaits that cause flaky tests. <code>noUnusedLocals</code> keeps imports clean and startup fast.</p>`
    },
    {
      id: "27ab85dd-ac64-4050-8771-febfa0282d37",
      q: "Co-located tests vs. a separate test directory — which do you use and when?",
      diff: "mid",
      tags: ["architecture", "conventions"],
      answer: `<table style="width:100%; font-size:13px; border-collapse:collapse;">
<tr><th style="padding:6px;">Model</th><th style="padding:6px;">Structure</th><th style="padding:6px;">Best for</th></tr>
<tr><td style="padding:6px;"><strong>Co-located</strong></td><td style="padding:6px;"><code>src/components/Button/Button.spec.ts</code></td><td style="padding:6px;">Unit/component tests, dev-owned, monorepos</td></tr>
<tr><td style="padding:6px;"><strong>Separate</strong></td><td style="padding:6px;"><code>e2e/tests/checkout.spec.ts</code></td><td style="padding:6px;">E2E, QA-owned, multi-app journeys</td></tr>
</table>
<p><strong>Recommended hybrid:</strong></p>
<pre class="code"><code>src/
  components/
    Button/
      Button.tsx
      Button.spec.ts        # unit/component — lives with the code it tests

e2e/
  tests/
    checkout.spec.ts        # E2E — separate, QA-owned
    auth.spec.ts
  pages/
  fixtures/
  utils/</code></pre>
<p>E2E tests exercise multiple source files and full user journeys — co-location with any single source file makes no sense. Component tests belong next to the component so that deleting the component also deletes the test. Never mix the two conventions in the same folder — it breaks <code>testMatch</code> patterns and confuses CI configuration.</p>`
    },
    {
      id: "d1c960b8-8766-4240-bd94-83e333146cdc",
      q: "How do you version and share test utilities across multiple repositories?",
      diff: "hard",
      tags: ["architecture", "monorepo"],
      answer: `<p>Three options by team maturity:</p>
<p><strong>1. Private npm package</strong> — most robust. Version with semver, publish to Nexus or GitHub Packages, consumers pin a version.</p>
<pre class="code"><code>// @company/test-utils — published internally
import { createFactory, assertSchema } from '@company/test-utils';
import { userFactory }                 from '@company/test-utils/factories';</code></pre>
<p><strong>2. Monorepo workspace package</strong> — no publishing step, always latest.</p>
<pre class="code"><code>// packages/test-utils/package.json
{ "name": "@company/test-utils", "version": "1.0.0" }

// apps/web/package.json
{ "devDependencies": { "@company/test-utils": "workspace:*" } }</code></pre>
<p><strong>3. Git submodule</strong> — avoid. No versioning, merge conflicts on updates, poor DX.</p>
<p><strong>What belongs in shared utils:</strong> schema validators, factory helpers, typed assertion wrappers, seed script utilities, shared TypeScript types.</p>
<p><strong>What does NOT belong:</strong> Playwright fixtures (they depend on test context), environment-specific config, test data values. Those stay per-repo.</p>`
    },
  ],
};

// ─── Visual Regression ───────────────────────────────────────────────────────

const visualRegression: Category = {
  id: "visual-regression",
  label: "Visual regression",
  desc: "Screenshot testing, baseline management, tooling, CI integration, and eliminating flakes",
  questions: [
    {
      id: "19c89568-85e5-4093-9897-9520c4aadd1c",
      q: "Compare Playwright screenshots, Percy, and Applitools — when do you choose each?",
      diff: "hard",
      tags: ["visual", "tools"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Visual regression tool comparison matrix">
  <style>
    .ti { font: 600 12px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); text-anchor: middle; }
    .h { font: 600 11px ui-sans-serif, system-ui; fill: currentColor; }
    .cell { fill: var(--bg); stroke: currentColor; stroke-width: 0.6; opacity: 0.7; }
    .yes { fill: #2a9d8f; }
    .partial { fill: #e9c46a; }
    .no { fill: #e76f51; }
    .dot { font: 700 13px ui-sans-serif, system-ui; text-anchor: middle; }
  </style>
  <text x="200" y="20" class="h">Playwright</text>
  <text x="320" y="20" class="h">Percy</text>
  <text x="440" y="20" class="h">Applitools</text>
  <g>
    <text x="20" y="48" class="h">Free</text>
    <rect x="150" y="34" width="100" height="20" class="cell"/>
    <circle cx="200" cy="44" r="7" class="yes"/><text x="200" y="48" class="dot" fill="#fff">✓</text>
    <rect x="270" y="34" width="100" height="20" class="cell"/>
    <circle cx="320" cy="44" r="7" class="no"/><text x="320" y="48" class="dot" fill="#fff">✗</text>
    <rect x="390" y="34" width="100" height="20" class="cell"/>
    <circle cx="440" cy="44" r="7" class="no"/><text x="440" y="48" class="dot" fill="#fff">✗</text>
  </g>
  <g>
    <text x="20" y="76" class="h">Consistent env</text>
    <rect x="150" y="62" width="100" height="20" class="cell"/>
    <circle cx="200" cy="72" r="7" class="partial"/><text x="200" y="76" class="dot" fill="#222">~</text>
    <rect x="270" y="62" width="100" height="20" class="cell"/>
    <circle cx="320" cy="72" r="7" class="yes"/><text x="320" y="76" class="dot" fill="#fff">✓</text>
    <rect x="390" y="62" width="100" height="20" class="cell"/>
    <circle cx="440" cy="72" r="7" class="yes"/><text x="440" y="76" class="dot" fill="#fff">✓</text>
  </g>
  <g>
    <text x="20" y="104" class="h">Cross-browser</text>
    <rect x="150" y="90" width="100" height="20" class="cell"/>
    <circle cx="200" cy="100" r="7" class="partial"/><text x="200" y="104" class="dot" fill="#222">~</text>
    <rect x="270" y="90" width="100" height="20" class="cell"/>
    <circle cx="320" cy="100" r="7" class="yes"/><text x="320" y="104" class="dot" fill="#fff">✓</text>
    <rect x="390" y="90" width="100" height="20" class="cell"/>
    <circle cx="440" cy="100" r="7" class="yes"/><text x="440" y="104" class="dot" fill="#fff">✓</text>
  </g>
  <g>
    <text x="20" y="132" class="h">AI false-positive filter</text>
    <rect x="150" y="118" width="100" height="20" class="cell"/>
    <circle cx="200" cy="128" r="7" class="no"/><text x="200" y="132" class="dot" fill="#fff">✗</text>
    <rect x="270" y="118" width="100" height="20" class="cell"/>
    <circle cx="320" cy="128" r="7" class="partial"/><text x="320" y="132" class="dot" fill="#222">~</text>
    <rect x="390" y="118" width="100" height="20" class="cell"/>
    <circle cx="440" cy="128" r="7" class="yes"/><text x="440" y="132" class="dot" fill="#fff">✓</text>
  </g>
  <g>
    <text x="20" y="160" class="h">Visual review UI</text>
    <rect x="150" y="146" width="100" height="20" class="cell"/>
    <circle cx="200" cy="156" r="7" class="partial"/><text x="200" y="160" class="dot" fill="#222">~</text>
    <rect x="270" y="146" width="100" height="20" class="cell"/>
    <circle cx="320" cy="156" r="7" class="yes"/><text x="320" y="160" class="dot" fill="#fff">✓</text>
    <rect x="390" y="146" width="100" height="20" class="cell"/>
    <circle cx="440" cy="156" r="7" class="yes"/><text x="440" y="160" class="dot" fill="#fff">✓</text>
  </g>
  <text x="260" y="190" class="sub">Start with Playwright. Move up when false positives or cross-browser matter more than license cost.</text>
</svg>
</div>
<table style="width:100%; font-size:13px; border-collapse:collapse;">
<tr><th style="padding:6px;">Tool</th><th style="padding:6px;">Approach</th><th style="padding:6px;">Pro</th><th style="padding:6px;">Con</th></tr>
<tr><td style="padding:6px;"><strong>Playwright built-in</strong></td><td style="padding:6px;">Pixel diff, baselines in repo</td><td style="padding:6px;">Free, zero infra, version-controlled</td><td style="padding:6px;">OS/font-rendering sensitive, manual review</td></tr>
<tr><td style="padding:6px;"><strong>Percy</strong></td><td style="padding:6px;">Cloud rendering, cross-browser</td><td style="padding:6px;">Consistent environment, visual review UI, GitHub integration</td><td style="padding:6px;">Paid, network dependency per run</td></tr>
<tr><td style="padding:6px;"><strong>Applitools Eyes</strong></td><td style="padding:6px;">AI-powered layout diff</td><td style="padding:6px;">Near-zero false positives, ignores rendering noise</td><td style="padding:6px;">Expensive, over-engineered for small teams</td></tr>
</table>
<p><strong>How to choose:</strong></p>
<ul>
<li>Small team, low budget → Playwright built-in. Always run on Linux in Docker — same OS every time.</li>
<li>Medium team, cross-browser matters → Percy. Eliminates the OS pixel-diff problem.</li>
<li>Large team where visual quality is core product value → Applitools. The AI diff pays off when you have hundreds of screenshot tests generating constant false positives.</li>
</ul>
<p>Start with Playwright. Migrate only when false positives are consistently blocking PRs and costing more time than the tool costs money.</p>`
    },
    {
      id: "d8c188f5-8019-4656-97c8-07c8d65ebfbd",
      q: "Who should update screenshot baselines, and when?",
      diff: "hard",
      tags: ["visual", "process"],
      answer: `<p>Baseline updates are intentional decisions, not automatic fixes. Automating them defeats the entire purpose of visual regression.</p>
<p><strong>The right process:</strong></p>
<ol>
<li>Test fails with a visual diff artifact stored in <code>test-results/</code>.</li>
<li>Developer or QA opens the diff image and reviews the change.</li>
<li><strong>If the change is intentional</strong> (approved redesign, design system update) → update baseline, put it in the PR for review.</li>
<li><strong>If the change is unintentional</strong> → it is a bug. File a ticket. Do not update the baseline.</li>
<li>Baseline changes go through code review — another pair of eyes on every visual change before it ships.</li>
</ol>
<pre class="code"><code># Update baselines locally — always review the diff first
npx playwright test --update-snapshots

# NEVER run this automatically in CI on failure
# That turns visual regression into a broken window that everyone ignores</code></pre>
<p><strong>Storage:</strong> keep baselines in version control under <code>tests/snapshots/</code>. Name them descriptively: <code>checkout-light-1280.png</code>, <code>checkout-dark-mobile.png</code>. Review snapshot file changes in PRs the same way you review code changes.</p>`
    },
    {
      id: "217f394b-6b3d-4d6b-bd87-56bc9728d82b",
      q: "Component-level vs. page-level visual regression — which is more maintainable?",
      diff: "mid",
      tags: ["visual", "strategy"],
      answer: `<p>Both have a role. The question is what each protects and at what cost.</p>
<table style="width:100%; font-size:13px; border-collapse:collapse;">
<tr><th style="padding:6px;">Level</th><th style="padding:6px;">Scope</th><th style="padding:6px;">When to use</th></tr>
<tr><td style="padding:6px;"><strong>Full page</strong></td><td style="padding:6px;">Entire viewport</td><td style="padding:6px;">Marketing pages, layouts — rarely</td></tr>
<tr><td style="padding:6px;"><strong>Region / scoped</strong></td><td style="padding:6px;">A specific locator</td><td style="padding:6px;">Best balance — focused, low noise</td></tr>
<tr><td style="padding:6px;"><strong>Component (Storybook)</strong></td><td style="padding:6px;">Isolated component state</td><td style="padding:6px;">Design system, UI library</td></tr>
</table>
<pre class="code"><code>// Full page — any change anywhere fails it. Very noisy.
await expect(page).toHaveScreenshot('home-full.png');

// Scoped region — only the product card. Much more stable.
await expect(page.getByTestId('product-card').first())
  .toHaveScreenshot('product-card.png');

// Per state — one screenshot per meaningful UI state
await checkout.goToPaymentStep();
await expect(page.getByTestId('payment-form'))
  .toHaveScreenshot('payment-step.png');</code></pre>
<p><strong>Recommendation:</strong> component-level tests in Storybook for the design system, scoped region screenshots in Playwright for integration-level visual checks. Avoid full-page screenshots — every content change breaks them and reviewer fatigue sets in fast.</p>`
    },
    {
      id: "08e206a2-344f-4b0c-9358-0ab88a251feb",
      q: "What causes pixel-level flakiness in screenshot tests and how do you fix each cause?",
      diff: "hard",
      tags: ["visual", "flakiness"],
      answer: `<table style="width:100%; font-size:13px; border-collapse:collapse;">
<tr><th style="padding:6px;">Cause</th><th style="padding:6px;">Fix</th></tr>
<tr><td style="padding:6px;">OS font-rendering differences</td><td style="padding:6px;">Always run baselines and CI on the same OS. Use the official Playwright Docker image — never compare macOS vs Linux screenshots.</td></tr>
<tr><td style="padding:6px;">Animations mid-screenshot</td><td style="padding:6px;"><code>animations: 'disabled'</code> in config, or inject <code>* { animation-duration: 0s !important; transition: none !important; }</code></td></tr>
<tr><td style="padding:6px;">Dynamic content (timestamps, ads)</td><td style="padding:6px;"><code>mask: [page.getByTestId('timestamp')]</code> — replaces region with solid colour</td></tr>
<tr><td style="padding:6px;">Scroll position</td><td style="padding:6px;"><code>await page.evaluate(() =&gt; window.scrollTo(0, 0))</code> before capturing</td></tr>
<tr><td style="padding:6px;">Lazy-loaded images not yet visible</td><td style="padding:6px;"><code>await page.waitForLoadState('networkidle')</code> before the screenshot</td></tr>
<tr><td style="padding:6px;">Sub-pixel anti-aliasing</td><td style="padding:6px;"><code>maxDiffPixelRatio: 0.01</code> — tolerate up to 1% pixel difference</td></tr>
</table>
<pre class="code"><code>await expect(page.getByTestId('checkout-form')).toHaveScreenshot('checkout.png', {
  animations:        'disabled',
  mask:              [page.getByTestId('user-avatar'), page.getByTestId('timestamp')],
  maxDiffPixelRatio: 0.01,
});</code></pre>`
    },
    {
      id: "594b0adb-43e2-4888-b27c-dd189ec93d6f",
      q: "How do you test dark mode and light mode visually?",
      diff: "mid",
      tags: ["visual", "theming"],
      answer: `<pre class="code"><code>// Option 1 — Playwright projects per colour scheme (cleanest)
// playwright.config.ts
projects: [
  { name: 'light', use: { ...devices['Desktop Chrome'], colorScheme: 'light' } },
  { name: 'dark',  use: { ...devices['Desktop Chrome'], colorScheme: 'dark'  } },
],
// Playwright sets prefers-color-scheme media query automatically

// Option 2 — Force theme via attribute in the test
test('dark mode checkout', async ({ page }) =&gt; {
  await page.goto('/checkout');
  await page.evaluate(() =&gt; {
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await expect(page.getByTestId('checkout-form'))
    .toHaveScreenshot('checkout-dark.png', { animations: 'disabled' });
});

// Option 3 — Use the app's theme toggle
test('both themes render correctly', async ({ page }) =&gt; {
  await page.goto('/');
  await expect(page.getByTestId('hero')).toHaveScreenshot('hero-light.png');

  await page.getByTestId('theme-toggle').click();
  await expect(page.getByTestId('hero')).toHaveScreenshot('hero-dark.png');
});</code></pre>
<p>Keep separate baseline files per theme: <code>checkout-light-1280.png</code>, <code>checkout-dark-1280.png</code>. Never share baselines between themes — they differ by design. The project-based approach (Option 1) is most robust because Playwright controls the colour scheme at the browser level.</p>`
    },
    {
      id: "ca29f314-e5b6-4db0-8ff0-6f4f36fc6c66",
      q: "How do you integrate visual regression into CI without blocking every PR?",
      diff: "hard",
      tags: ["visual", "ci"],
      answer: `<p>Running visual regression on every PR generates noise and reviewer fatigue. The right cadence:</p>
<table style="width:100%; font-size:13px; border-collapse:collapse;">
<tr><th style="padding:6px;">Trigger</th><th style="padding:6px;">Visual tests</th><th style="padding:6px;">Reason</th></tr>
<tr><td style="padding:6px;">Every PR</td><td style="padding:6px;">Smoke — 3–5 critical pages</td><td style="padding:6px;">Fast, catches catastrophic regressions</td></tr>
<tr><td style="padding:6px;">PRs touching CSS or design tokens</td><td style="padding:6px;">Full visual suite</td><td style="padding:6px;">Triggered by path filter</td></tr>
<tr><td style="padding:6px;">Merge to main</td><td style="padding:6px;">Full visual suite</td><td style="padding:6px;">Gates staging deployment</td></tr>
<tr><td style="padding:6px;">Pre-release</td><td style="padding:6px;">Cross-browser visual</td><td style="padding:6px;">Final safety net before production</td></tr>
</table>
<pre class="code"><code># GitHub Actions — run full visual suite only on CSS/component changes
on:
  pull_request:
    paths:
      - 'src/**/*.css'
      - 'src/components/**'
      - 'src/styles/**'</code></pre>
<p>Always upload diff artifacts on failure — never fail CI silently on a visual difference. Require a human review step before a visual failure blocks merge. False positives that block merges are the fastest way to get visual testing disabled by the team.</p>`
    },
    {
      id: "75f7dc2d-6036-44aa-a694-f88344521961",
      q: "How do you use Storybook for visual regression testing?",
      diff: "mid",
      tags: ["visual", "storybook"],
      diagram: `flowchart LR
  STORIES["Button.stories.ts<br/>Primary · Disabled · Loading"] --> SB["Storybook build<br/>(static site)"]
  SB --> OPT{"integration"}
  OPT -->|"Chromatic"| CR["cloud render<br/>diff in PR UI<br/>$ paid"]
  OPT -->|"test-runner"| TR["jest-style runner<br/>+ Playwright screenshots"]
  OPT -->|"manual"| PW["Playwright<br/>goto iframe.html?id=..."]
  CR --> BASE[(baselines<br/>+ approval flow)]
  TR --> BASE
  PW --> BASE
  classDef opt fill:#0a3d6e,color:#fff
  classDef store fill:#2a9d8f,color:#fff
  class STORIES,SB store
  class CR,TR,PW opt`,
      answer: `<p>Storybook renders components in isolation — ideal for component-level visual regression because there is no page-level noise.</p>
<pre class="code"><code>// Button.stories.ts — each story = a state to screenshot
export const Primary:  Story = { args: { label: 'Submit', variant: 'primary' } };
export const Disabled: Story = { args: { label: 'Submit', disabled: true    } };
export const Loading:  Story = { args: { label: 'Submit', loading: true      } };</code></pre>
<p><strong>Integration options:</strong></p>
<ul>
<li><strong>Chromatic</strong> (by Storybook maintainers) — cloud service, auto-detects story changes, visual review UI in the PR. Best DX, paid.</li>
<li><strong>@storybook/test-runner</strong> — runs assertions and interactions against stories in a real browser. Free, pairs with Playwright screenshots.</li>
<li><strong>Playwright visiting Storybook iframe</strong> — manual but free.</li>
</ul>
<pre class="code"><code>// Playwright visiting isolated story
test('Button — primary state', async ({ page }) =&gt; {
  await page.goto('http://localhost:6006/iframe.html?id=button--primary');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#storybook-root'))
    .toHaveScreenshot('button-primary.png', { animations: 'disabled' });
});</code></pre>
<p>Strategy: component visual tests in Storybook (isolated, fast, dev-friendly) + page-level region screenshots in Playwright E2E (integration-level). Together they cover both the design system and real page composition.</p>`
    },
  ],
};

// ─── Feature Flags ───────────────────────────────────────────────────────────

const featureFlags: Category = {
  id: "feature-flags",
  label: "Feature flags",
  desc: "Testing flagged features, rollouts, A/B experiments, dark launches, and flag lifecycle",
  questions: [
    {
      id: "0b72971d-57ce-44d3-9d39-0995df76c9c8",
      q: "How do you structure tests when a feature has three states: off, on, and 10% rollout?",
      diff: "hard",
      tags: ["feature-flags", "strategy"],
      diagram: `stateDiagram-v2
  [*] --> OFF
  OFF --> ON: enable for everyone
  OFF --> PARTIAL: 10% rollout
  PARTIAL --> ON: ramp to 100%
  PARTIAL --> OFF: kill switch
  ON --> OFF: revert
  state OFF {
    [*] --> legacy_path
  }
  state ON {
    [*] --> new_path
  }
  state PARTIAL {
    [*] --> sampled
    sampled --> bucket_A: hash(user) < 10%
    sampled --> bucket_B: else
  }`,
      answer: `<p>Model all three states explicitly. Never depend on the rollout sampling — you cannot control which bucket your test lands in.</p>
<pre class="code"><code>// Fixture: force-set flags per test, reset on teardown
const test = base.extend&lt;{ flags: FlagClient }&gt;({
  flags: async ({ page }, use) =&gt; {
    const client = new FlagClient(page);
    await use(client);
    await client.reset(); // always restore defaults
  },
});

// Three distinct test groups
test.describe('new checkout — flag OFF', () =&gt; {
  test.beforeEach(async ({ flags }) =&gt; flags.disable('new-checkout'));
  test('shows legacy checkout form', async ({ page }) =&gt; { ... });
});

test.describe('new checkout — flag ON', () =&gt; {
  test.beforeEach(async ({ flags }) =&gt; flags.enable('new-checkout'));
  test('shows new checkout form', async ({ page }) =&gt; { ... });
  test('completes order in new flow', async ({ page }) =&gt; { ... });
});

test.describe('new checkout — rollout edge cases', () =&gt; {
  test('toggling mid-session does not corrupt cart', async ({ page, flags }) =&gt; {
    await flags.enable('new-checkout');
    await page.goto('/checkout');
    await page.getByTestId('add-item').click();
    await flags.disable('new-checkout'); // toggle while user is on the page
    await page.reload();
    // Cart items must survive the flag change
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });
});</code></pre>
<p>Force the flag via override header, admin API, cookie, or test account attribute — whichever your flag service supports. Never depend on sampling logic in automated tests.</p>`
    },
    {
      id: "099ee5e1-a09d-4bfa-afe7-7e26bf05a08f",
      q: "What is a dark launch and how do you verify one works correctly?",
      diff: "hard",
      tags: ["feature-flags", "strategy"],
      answer: `<p>A dark launch sends real traffic through new code but hides the output from users. Used to validate backend behavior at production scale before any UI ships.</p>
<pre class="code"><code>// Dark launch: new pricing engine runs in shadow alongside the current one.
// Users see the current result. The new result is logged and monitored.

test('dark launch pricing engine executes and logs a valid result', async ({ request }) =&gt; {
  const response = await request.post('/api/cart/calculate', {
    data:    { items: [{ sku: 'SKU-001', qty: 2 }] },
    headers: { 'X-Feature-Flag': 'new-pricing=shadow' },
  });

  // Legacy result still returned — user experience unchanged
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.total).toBeGreaterThan(0);

  // Shadow result should be logged — query observability
  const logs = await logsClient.query({
    filter: \`shadow_pricing AND cart_id=\${body.cartId}\`,
    since:  '30s',
  });
  expect(logs).toHaveLength(1);
  expect(logs[0].shadowTotal).toBeGreaterThan(0);
});</code></pre>
<p>Dark launch verification is log-based, not response-based. Requires access to your observability stack in tests — a logs-query fixture or metrics API client. The test proves the shadow path executed, produced a valid result, and did not affect the user-visible response.</p>`
    },
    {
      id: "357a0d59-923b-445d-a868-e725ef1c1af7",
      q: "How do you test two feature flags that interact with the same user flow?",
      diff: "hard",
      tags: ["feature-flags", "strategy"],
      answer: `<p>Interacting flags create a combination matrix. Enumerate it explicitly — the <code>on/on</code> case is almost always the one never manually tested and the one that ships bugs.</p>
<pre class="code"><code>// Two flags: new-payment-form + express-checkout
// 2 × 2 = 4 combinations

const combinations = [
  { newPayment: false, express: false, expectedForm: 'legacy-form'    },
  { newPayment: true,  express: false, expectedForm: 'new-form'       },
  { newPayment: false, express: true,  expectedForm: 'express-legacy' },
  { newPayment: true,  express: true,  expectedForm: 'express-new'    }, // ← the risky one
] as const;

for (const { newPayment, express, expectedForm } of combinations) {
  test(
    \`flags: new-payment=\${newPayment} express=\${express} → \${expectedForm}\`,
    async ({ page, flags }) =&gt; {
      await flags.set({ 'new-payment-form': newPayment, 'express-checkout': express });
      await page.goto('/checkout');
      await expect(page.getByTestId(expectedForm)).toBeVisible();
    }
  );
}</code></pre>
<p>With N flags each having 2 states, you have 2^N combinations. Three flags = 8. Focus on: all off, all on, and each flag on alone. Skip low-risk combos only after deliberate risk analysis — not because you forgot to test them.</p>`
    },
    {
      id: "8b1e408f-9b76-430e-b418-24d61b10bb2c",
      q: "How do you validate that an A/B test variant works correctly before production rollout?",
      diff: "mid",
      tags: ["feature-flags", "ab-testing"],
      answer: `<pre class="code"><code>// A/B: variant A = multi-step checkout, variant B = one-page checkout
// Force variant B assignment — never depend on random sampling

test('variant B: one-page checkout completes an order', async ({ page }) =&gt; {
  await page.addInitScript(() =&gt; {
    document.cookie = 'ab_experiment=checkout_v2:variant_b; path=/';
  });

  await page.goto('/checkout');

  // Assert variant B is rendered
  await expect(page.getByTestId('one-page-checkout')).toBeVisible();
  await expect(page.getByTestId('multi-step-checkout')).not.toBeVisible();

  // Complete the full checkout flow in variant B
  await page.getByLabel('Card number').fill('4242424242424242');
  await page.getByLabel('Expiry').fill('12/30');
  await page.getByRole('button', { name: 'Buy now' }).click();
  await expect(page.getByText('Order confirmed')).toBeVisible();

  // Verify analytics fires the correct variant label
  const analyticsRequest = await page.waitForRequest(r =&gt;
    r.url().includes('/analytics') &amp;&amp; r.postData()?.includes('checkout_complete')
  );
  expect(JSON.parse(analyticsRequest.postData()!).variant).toBe('variant_b');
});</code></pre>
<p>Test both variants fully — variant B ships to 50% of real users. Also test: switching variants mid-session does not corrupt cart state, and analytics always records the correct variant label (wrong label = the experiment is unmeasurable).</p>`
    },
    {
      id: "8f210726-dc8b-4a44-a5ef-62990315d2f2",
      q: "When should a stale feature flag be removed and how do you test the removal safely?",
      diff: "mid",
      tags: ["feature-flags", "lifecycle"],
      answer: `<p>Stale flags accumulate dead conditional branches, make code unreadable, and occasionally get toggled by mistake in production. They are technical debt with a blast radius.</p>
<p><strong>Remove a flag when:</strong></p>
<ul>
<li>It has been at 100% rollout for 1–2 sprints with no incidents.</li>
<li>The team has decided the "off" path will never be needed again.</li>
<li>The flag service dashboard shows zero traffic to the "off" branch.</li>
</ul>
<p><strong>Safe removal process:</strong></p>
<ol>
<li>Delete the flag from the flag service.</li>
<li>Remove all flag checks from the codebase — leave only the "on" behavior as the default.</li>
<li>Run the full test suite. Tests that forced <code>flag = false</code> now test the deleted code path — they should fail or be removed.</li>
<li>Delete the "off" test group entirely.</li>
<li>Rename the "on" test group — it is now the permanent regression suite.</li>
</ol>
<pre class="code"><code>// Before removal
test.describe('with flag OFF', () =&gt; { ... }); // ← DELETE this group
test.describe('with flag ON',  () =&gt; { ... }); // ← KEEP, rename

// After removal — flag gone, this IS the behavior
test.describe('checkout', () =&gt; {
  test('completes order with new form', ...); // permanent test
});</code></pre>`
    },
    {
      id: "f154115f-5d60-4cba-bfa4-9f08fa2ca3bf",
      q: "How do you prevent feature flag state from leaking between parallel test workers?",
      diff: "hard",
      tags: ["feature-flags", "isolation", "ci"],
      answer: `<p>Feature flag state is global by default — one worker enabling a flag can affect all other workers sharing the same session, user, or environment.</p>
<p><strong>Isolation strategies, best to worst:</strong></p>
<ol>
<li><strong>Per-request override via HTTP header</strong> — most portable. Server reads the header and applies the flag only for that request. Zero shared state between workers.</li>
</ol>
<pre class="code"><code>await page.setExtraHTTPHeaders({ 'X-Feature-Flag': 'new-checkout=on' });</code></pre>
<ol start="2">
<li><strong>Per-user flag override</strong> — assign the flag to the test user's account. Since each parallel worker uses a unique test user, overrides are fully isolated.</li>
</ol>
<pre class="code"><code>await apiClient.setUserFlag(testUser.id, 'new-checkout', true);</code></pre>
<ol start="3">
<li><strong>Per-worker environment</strong> — each worker runs against its own isolated instance. Maximum isolation, maximum cost.</li>
</ol>
<p><strong>What to never do:</strong></p>
<pre class="code"><code>// ❌ Global state — bleeds into every other worker in the same run
await flagClient.enableGlobally('new-checkout');

// ✅ Always reset in teardown — even if the test fails
test.afterEach(async ({ flags }) =&gt; {
  await flags.reset(); // guaranteed cleanup via fixture teardown
});</code></pre>`
    },
  ],
};



/* ============================================================================
   ASSEMBLE
   ========================================================================= */

export const PART_4_CATEGORIES: Category[] = [
  typescriptProgramming,
  graphqlContracts,
  projectStructure,
  visualRegression,
  featureFlags,
];
