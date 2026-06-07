import type { Category } from "../types";

// Categories will be assembled at the bottom.
// Each section is its own const for readability and easier diff-review.

const playwrightTS: Category = {
  id: "playwright-ts",
  label: "Playwright + TS",
  desc: "Locators, fixtures, async patterns, auto-waiting, framework-grade code",
  questions: [
    {
      id: "847d243e-3692-4c18-89a0-ffd32fe1c971",
      q: "What is the difference between page.locator() and page.$()? Which should you use in a senior framework?",
      diff: "mid",
      tags: ["playwright", "locators"],
      media: [
        {
          type: "youtube",
          src: "https://www.youtube.com/watch?v=Mzx00MGOyAY",
          caption: "Playwright fundamentals — locators in practice",
        },
      ],
      diagram: `flowchart TB
  subgraph DOLLAR["page.$('.btn')  — eager snapshot"]
    D1["query DOM<br/>→ ElementHandle"] --> D2["DOM re-renders<br/>(React state change)"]
    D2 --> D3["handle is STALE<br/>refers to detached node"]
    D3 --> D4["action throws<br/>or hits ghost node"]
  end
  subgraph LOC["page.locator('.btn')  — lazy"]
    L1["create Locator<br/>(no DOM call yet)"] --> L2["call .click()"]
    L2 --> L3["re-query DOM<br/>+ auto-wait"]
    L3 --> L4["click latest matching node"]
  end
  classDef bad fill:#e76f51,color:#fff
  classDef good fill:#2a9d8f,color:#fff
  class D3,D4 bad
  class L3,L4 good`,
      answer: `<p><strong>page.$()</strong> is a legacy method returning an <code>ElementHandle</code> — a one-time DOM snapshot. If the element re-renders, the handle is stale.</p>
<p><strong>page.locator()</strong> is lazy and re-queries the DOM on every action. It's the modern recommended API and survives re-renders.</p>
<p>Always use <code>locator()</code> in senior framework code. Locators power Playwright's auto-waiting and retry-ability.</p>
<pre class="code"><code>// ❌ Avoid
const handle = await page.$('.btn');
await handle.click();

// ✅ Prefer
await page.locator('.btn').click();</code></pre>`
    },
    {
      id: "095314fd-a666-4ea9-9848-11e27b4db6eb",
      q: "Walk through Playwright's auto-waiting mechanism. What does it actually wait for, and where does it fall short?",
      diff: "hard",
      tags: ["playwright", "flakiness"],
      diagram: `flowchart TD
  ACT["await locator.click()"] --> A1{"Attached<br/>to DOM?"}
  A1 -- no --> WAIT["retry<br/>(every 100ms)"]
  A1 -- yes --> A2{"Visible?<br/>(non-zero size)"}
  A2 -- no --> WAIT
  A2 -- yes --> A3{"Stable?<br/>(not animating)"}
  A3 -- no --> WAIT
  A3 -- yes --> A4{"Enabled?<br/>(not disabled)"}
  A4 -- no --> WAIT
  A4 -- yes --> A5{"Receives<br/>events?"}
  A5 -- no --> WAIT
  A5 -- yes --> GO["perform click ✓"]
  WAIT --> TO{"Within<br/>timeout?"}
  TO -- yes --> A1
  TO -- no --> FAIL["throw TimeoutError<br/>(actionability failed)"]
  classDef bad fill:#e76f51,color:#fff
  classDef good fill:#2a9d8f,color:#fff
  class FAIL bad
  class GO good`,
      answer: `<p>Before any action like <code>click()</code> or <code>fill()</code>, Playwright runs <strong>actionability checks</strong>: element is attached, visible, stable (not animating), enabled, receives events.</p>
<p>Web-first assertions like <code>expect(locator).toHaveText()</code> retry until the assertion passes or the timeout expires.</p>
<p><strong>Where it falls short:</strong></p>
<ul>
<li>Waits for the element, NOT for downstream state. Click triggers an API call → Playwright doesn't wait for the response unless you use <code>page.waitForResponse()</code>.</li>
<li><code>locator.all()</code> doesn't wait — it returns whatever's in the DOM. Use <code>expect(locator).toHaveCount(n)</code> first.</li>
<li>Eventual consistency needs explicit polling with <code>expect.poll()</code>.</li>
</ul>`
    },
    {
      id: "e9d8b68b-fbc6-46de-a2ad-1e17b0f87455",
      q: "Implement a TypeScript Page Object for a checkout page with proper encapsulation.",
      diff: "mid",
      tags: ["playwright", "typescript", "pom"],
      answer: `<p>Senior-grade POM: locators are private, methods express user intent, no <code>page.*</code> calls leak into tests.</p>
<div class="code-walk">
<pre class="code"><code>import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  private readonly page: Page;                                              // ①
  private readonly cartItems: Locator;
  private readonly placeOrderBtn: Locator;
  private readonly orderConfirmation: Locator;

  constructor(page: Page) {                                                 // ②
    this.page = page;
    this.cartItems = page.getByTestId('cart-item');                         // ③
    this.placeOrderBtn = page.getByRole('button', { name: 'Place order' });
    this.orderConfirmation = page.getByRole('heading', { name: /order confirmed/i });
  }

  async goto() {                                                            // ④
    await this.page.goto('/checkout');
    await expect(this.placeOrderBtn).toBeVisible();                         // ⑤
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async placeOrder() {                                                      // ⑥
    await this.placeOrderBtn.click();
    await expect(this.orderConfirmation).toBeVisible();
  }
}</code></pre>
<ol class="code-walk-notes">
  <li><span class="cw-num">1</span><span><code>private readonly</code> — tests can't reach in and grab a raw locator. They must call methods. This is the encapsulation that distinguishes a POM from a "page of selectors".</span></li>
  <li><span class="cw-num">2</span><span>All locators built in the constructor. Cheap (lazy) — they don't query the DOM until used.</span></li>
  <li><span class="cw-num">3</span><span><code>getByRole</code> and <code>getByTestId</code> over CSS classes. Survives styling refactors; matches what users / assistive tech see.</span></li>
  <li><span class="cw-num">4</span><span>Method name = user intent (<code>goto</code>, <code>placeOrder</code>), not implementation (<code>clickButton</code>).</span></li>
  <li><span class="cw-num">5</span><span>Wait for a stable post-condition before returning. The next test step can assume the page is ready.</span></li>
  <li><span class="cw-num">6</span><span>Action method always finishes with an assertion on the resulting state. Caller doesn't have to remember to verify success.</span></li>
</ol>
</div>
<p><strong>Senior signals:</strong> <code>getByRole</code>/<code>getByTestId</code> over CSS, intent-based methods, assertions on preconditions for next steps.</p>`
    },
    {
      id: "38ab2df2-cbe7-413b-af8f-d758ef6f341a",
      q: "Explain Playwright fixtures. Why are they superior to beforeEach hooks for a senior framework?",
      diff: "hard",
      tags: ["playwright", "fixtures", "architecture"],
      diagram: `graph LR
  TEST["test('places order')<br/>needs: checkoutPage, apiClient"]
  CP["checkoutPage"]
  AC["apiClient"]
  PAGE["page<br/>(built-in)"]
  REQ["request<br/>(built-in)"]
  TEST --> CP
  TEST --> AC
  CP --> PAGE
  AC --> REQ
  AC -.->|"setup: login()<br/>teardown: cleanup()"| AC
  classDef builtin fill:#e9c46a,color:#222
  classDef custom fill:#2a9d8f,color:#fff
  classDef test fill:#0a3d6e,color:#fff
  class PAGE,REQ builtin
  class CP,AC custom
  class TEST test`,
      answer: `<p>Fixtures provide <strong>dependency injection</strong>: each test declares what it needs, Playwright wires it up. Cleanup is guaranteed even on failure.</p>
<pre class="code"><code>import { test as base } from '@playwright/test';

type Fixtures = {
  checkoutPage: CheckoutPage;
  apiClient: APIClient;
};

export const test = base.extend<Fixtures>({
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  apiClient: async ({ request }, use) => {
    const client = new APIClient(request);
    await client.login();
    await use(client);
    await client.cleanup();
  },
});</code></pre>
<p><strong>Why fixtures beat beforeEach:</strong></p>
<ul>
<li><strong>Composable</strong> — multiple fixtures, no nesting hell.</li>
<li><strong>Lazy</strong> — only created if a test needs it.</li>
<li><strong>Scoped</strong> — <code>{ scope: 'worker' }</code> for expensive resources.</li>
<li><strong>Type-safe</strong> — IDE autocomplete on every test.</li>
</ul>`
    },
    {
      id: "84c68f69-4120-4f2e-9844-8919296e784d",
      q: "How do you reuse authentication state without logging in for every test?",
      diff: "mid",
      tags: ["playwright", "auth", "performance"],
      diagram: `flowchart LR
  subgraph SETUP["setup project (runs once)"]
    L["login via UI<br/>or API"] --> S["storageState({path: 'user.json'})<br/>cookies + localStorage"]
  end
  S --> FILE[("user.json")]
  subgraph TESTS["dependent project (runs N tests)"]
    FILE --> T1["test 1<br/>(starts logged in)"]
    FILE --> T2["test 2<br/>(starts logged in)"]
    FILE --> TN["test N<br/>(starts logged in)"]
  end
  classDef setup fill:#0a3d6e,color:#fff
  classDef good fill:#2a9d8f,color:#fff
  class L,S setup
  class T1,T2,TN good`,
      answer: `<p>Use a <strong>setup project</strong> that logs in once and saves <code>storageState</code>.</p>
<pre class="code"><code>// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /global\\.setup\\.ts/ },
  {
    name: 'chromium',
    dependencies: ['setup'],
    use: { storageState: 'playwright/.auth/user.json' },
  },
]

// global.setup.ts
test('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});</code></pre>
<p>Multi-role: separate state files per role. Even faster: skip UI login, hit the auth API directly.</p>`
    },
    {
      id: "1ab81cad-5f1b-4ea1-80b2-5928c2d33c19",
      q: "How do you intercept and mock a network request? When is it correct vs. wrong?",
      diff: "mid",
      tags: ["playwright", "mocking", "api"],
      diagram: `flowchart LR
  APP["page JS<br/>fetch('/api/payment')"] --> RT["page.route()<br/>interceptor"]
  RT --> DEC{"matches<br/>pattern?"}
  DEC -- no --> REAL["pass through to<br/>real server"]
  DEC -- yes --> ACT{"action?"}
  ACT -->|"fulfill"| MOCK["return canned response<br/>(status, headers, body)"]
  ACT -->|"continue"| MOD["modify and forward<br/>(headers, body, URL)"]
  ACT -->|"abort"| ERR["simulate network failure"]
  MOCK --> APP
  MOD --> REAL
  ERR --> APP
  classDef mock fill:#2a9d8f,color:#fff
  class MOCK,MOD,ERR mock`,
      answer: `<pre class="code"><code>await page.route('**/api/payment', async route => {
  await route.fulfill({
    status: 402,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'card_declined' }),
  });
});</code></pre>
<p><strong>When to mock:</strong> UI error states (rate limits, 5xx, timeouts), third-party APIs you can't control, isolation testing.</p>
<p><strong>When NOT to mock:</strong> happy paths (real integration matters), contract validation (mocks drift), end-to-end confidence.</p>`
    },
    {
      id: "3b30ae11-78b1-4908-b081-a96e3ece1e46",
      q: "What is expect.poll() and when do you use it instead of standard assertions?",
      diff: "hard",
      tags: ["playwright", "flakiness"],
      diagram: `flowchart TD
  S["expect.poll(fn).toBe('SHIPPED')"] --> C["call fn()<br/>(e.g. GET /orders/42)"]
  C --> E{"result ===<br/>'SHIPPED'?"}
  E -- yes --> PASS["assertion passes ✓"]
  E -- no --> T{"within<br/>timeout?"}
  T -- no --> FAIL["fail with last value<br/>+ history"]
  T -- yes --> W["wait<br/>(intervals: 1s, 2s, 5s...)"]
  W --> C
  classDef good fill:#2a9d8f,color:#fff
  classDef bad fill:#e76f51,color:#fff
  class PASS good
  class FAIL bad`,
      answer: `<p><code>expect.poll()</code> repeatedly evaluates a function until it returns the expected value or times out. Use it for non-DOM state — API responses, DB queries, derived state.</p>
<pre class="code"><code>// Standard — for DOM
await expect(page.getByText('Order placed')).toBeVisible();

// Polling — for non-DOM state
await expect.poll(async () => {
  const response = await apiClient.getOrderStatus(orderId);
  return response.status;
}, {
  message: 'Order should reach SHIPPED',
  intervals: [1000, 2000, 5000],
  timeout: 30000,
}).toBe('SHIPPED');</code></pre>
<p>For eventual consistency: button click triggers background job, UI shows "Processing" → "Done". <code>expect.poll</code> waits without arbitrary timeouts.</p>`
    },
    {
      id: "57023c00-399b-40d7-9615-cbd45bc11099",
      q: "Write a TypeScript retry wrapper with exponential backoff that only retries on network errors, not 4xx.",
      diff: "hard",
      tags: ["typescript", "patterns"],
      answer: `<div class="code-walk">
<pre class="code"><code>type RetryOptions = { attempts?: number; baseMs?: number };

async function retry&lt;T&gt;(                                              // ①
  fn: () =&gt; Promise&lt;T&gt;,
  { attempts = 3, baseMs = 200 }: RetryOptions = {}
): Promise&lt;T&gt; {
  let lastError: unknown;                                             // ②
  for (let i = 0; i &lt; attempts; i++) {
    try {
      return await fn();                                              // ③
    } catch (err: any) {
      lastError = err;
      if (err?.status &gt;= 400 &amp;&amp; err?.status &lt; 500) throw err;        // ④
      if (i &lt; attempts - 1) {
        await new Promise(r =&gt; setTimeout(r, baseMs * 2 ** i));       // ⑤
      }
    }
  }
  throw lastError;                                                    // ⑥
}</code></pre>
<ol class="code-walk-notes">
  <li><span class="cw-num">1</span><span>Generic <code>&lt;T&gt;</code> — preserves the return type of <code>fn</code>. Callers keep IntelliSense and type safety.</span></li>
  <li><span class="cw-num">2</span><span><code>unknown</code> over <code>any</code> for <code>lastError</code> — forces narrowing if anyone touches it later.</span></li>
  <li><span class="cw-num">3</span><span>Happy path returns immediately. Most calls succeed first try; retry overhead is paid only on failure.</span></li>
  <li><span class="cw-num">4</span><span>4xx = client error = our request is wrong. Retrying won't help and burns budget. Throw without retry.</span></li>
  <li><span class="cw-num">5</span><span>Exponential backoff: 200, 400, 800ms. Without backoff, retries can DDoS a struggling service. Add jitter (<code>baseMs * 2 ** i + Math.random() * 100</code>) in production.</span></li>
  <li><span class="cw-num">6</span><span>Preserve and re-throw the <em>last</em> error — gives callers the most recent failure context, not the first one.</span></li>
</ol>
</div>
<p>Senior signals: generic typing, retryable vs non-retryable distinction, exponential backoff, last-error preservation.</p>`
    },
    {
      id: "5e9678d5-670d-4c56-afcb-b64e0b5f07b6",
      q: "How do you parameterize a test to run with multiple data sets?",
      diff: "mid",
      tags: ["playwright", "data-driven"],
      answer: `<pre class="code"><code>const currencies = [
  { code: 'EUR', expectedTotal: '€42.50' },
  { code: 'USD', expectedTotal: '$45.00' },
  { code: 'RON', expectedTotal: '212.50 lei' },
];

for (const { code, expectedTotal } of currencies) {
  test(\`checkout total in \${code}\`, async ({ page }) =&gt; {
    await page.goto(\`/checkout?currency=\${code}\`);
    await expect(page.getByTestId('total')).toHaveText(expectedTotal);
  });
}</code></pre>
<p>Each runs as a separate test with its own report row. Don't put all in one test with a loop — when one fails, you lose the others' signal.</p>`
    },
    {
      id: "eaea2709-8727-43cf-8385-8a31f288b1c5",
      q: "How do you debug a Playwright test that fails only in CI?",
      diff: "hard",
      tags: ["playwright", "debugging", "ci"],
      diagram: `flowchart TD
  S["fails in CI<br/>passes locally"] --> T["open trace.zip<br/>(80% solved here)"]
  T --> CLUE{"clear cause?"}
  CLUE -- yes --> FIX["fix"]
  CLUE -- no --> H["run locally with<br/>--headless"]
  H --> H2{"reproduces?"}
  H2 -- yes --> FIX
  H2 -- no --> W["set workers: 1<br/>matches CI shard"]
  W --> W2{"now fails?"}
  W2 -- yes --> ISO["test data/state<br/>isolation bug"]
  W2 -- no --> V["pin viewport,<br/>match CI env vars"]
  V --> V2{"now fails?"}
  V2 -- yes --> FIX
  V2 -- no --> PB["check Playwright<br/>+ browser versions"]
  classDef hot fill:#e76f51,color:#fff
  classDef good fill:#2a9d8f,color:#fff
  class T,FIX good
  class S hot`,
      answer: `<ol>
<li><strong>Trace viewer</strong> — enable <code>trace: 'on-first-retry'</code>. Download the artifact, run <code>npx playwright show-trace trace.zip</code>.</li>
<li><strong>Headless vs. headed</strong> — run locally with <code>--headless</code> to match CI.</li>
<li><strong>Viewport</strong> — pin viewport in config.</li>
<li><strong>Speed</strong> — CI is slower. Look for race conditions, not just add waits.</li>
<li><strong>Worker count</strong> — set <code>workers: 1</code>. If it now passes, you have parallelism/state issues.</li>
<li><strong>Env vars</strong> — confirm all required vars are injected.</li>
<li><strong>Browser version drift</strong> — pin Playwright version, run <code>npx playwright install --with-deps</code>.</li>
</ol>
<p>Trace viewer alone solves 80% of these.</p>`
    },
    {
      id: "09beb14f-824b-4f0f-90ab-114900770f98",
      q: "Decode this playwright.config.ts and explain the senior signals.",
      diff: "hard",
      tags: ["playwright", "ci"],
      answer: `<pre class="code"><code>export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html'], ['github'], ['list']],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid',
  },
  projects: [
    { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
    { name: 'chromium', use: devices['Desktop Chrome'], dependencies: ['setup'] },
  ],
});</code></pre>
<ul>
<li><code>fullyParallel</code> + <code>workers</code> — they care about CI speed.</li>
<li><code>forbidOnly</code> in CI — prevents accidental <code>test.only</code>.</li>
<li><code>retries: 2</code> in CI only — detects flakes without masking real failures locally.</li>
<li><code>trace: 'on-first-retry'</code> — diagnostics without the storage cost.</li>
<li>Setup project for auth — they avoid logging in 100x.</li>
<li><code>testIdAttribute</code> — they enforce stable selectors.</li>
</ul>`
    },
    {
      id: "efc8a1ff-e399-4b2c-b802-35f09e0ae075",
      q: "What is testIdAttribute and why is it strategically important?",
      diff: "mid",
      tags: ["playwright", "selectors"],
      answer: `<p>Changes the attribute Playwright reads when you call <code>page.getByTestId()</code>. Default is <code>data-testid</code>.</p>
<pre class="code"><code>use: { testIdAttribute: 'data-qa' }

// Now this:
await page.getByTestId('submit-btn').click();
// targets: [data-qa="submit-btn"]</code></pre>
<p><strong>Strategic value:</strong> standardizing on test IDs makes selectors stable across UI refactors. CSS classes break when devs rename components — test IDs only break if a developer deliberately removes the contract.</p>`
    },
    {
      id: "cdaaae6b-10cb-4adf-82a2-036c53050486",
      q: "Explain TypeScript unknown vs. any. When do you use each?",
      diff: "mid",
      tags: ["typescript"],
      answer: `<p><code>any</code> opts out of type checking. <code>unknown</code> is type-safe — must narrow before use.</p>
<pre class="code"><code>let response: any = await fetch('/api');
response.foo.bar.baz; // ✅ compiles, ❌ crashes runtime

let response: unknown = await fetch('/api');
response.foo; // ❌ compile error
if (typeof response === 'object' &amp;&amp; response &amp;&amp; 'foo' in response) {
  // safe
}</code></pre>
<p>In tests: prefer <code>unknown</code> for API responses, validate with Zod or Ajv. <code>any</code> is acceptable in narrow scopes wrapping legacy code, never in shared utilities.</p>`
    },
    {
      id: "3e67b911-cd91-4d05-be7b-43c6625bf1ea",
      q: "What is a worker-scoped fixture and when do you need one?",
      diff: "hard",
      tags: ["playwright", "fixtures"],
      answer: `<p>Default fixtures are test-scoped. Worker-scoped are created once per worker process, shared across all tests in that worker.</p>
<pre class="code"><code>type WorkerFixtures = { dbConnection: Database };

export const test = base.extend&lt;{}, WorkerFixtures&gt;({
  dbConnection: [async ({}, use) =&gt; {
    const db = await Database.connect(process.env.TEST_DB_URL!);
    await use(db);
    await db.close();
  }, { scope: 'worker' }],
});</code></pre>
<p><strong>Use for:</strong> expensive read-only resources — DB connections, browser launches with heavy extensions.</p>
<p><strong>Don't use for:</strong> mutable state — concurrent tests interfere. Default test scope is safer.</p>`
    },
    {
      id: "f428a9e2-2e0a-4f15-9a3b-0ca38319e940",
      q: "How do you isolate test data when 8 parallel workers hit the same backend?",
      diff: "hard",
      tags: ["playwright", "data", "architecture"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Parallel workers with namespaced data">
  <style>
    .lbl { font: 600 11px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 11px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .ok { fill: #2a9d8f; }
    .bad { fill: #e76f51; }
    .warn { fill: #e9c46a; }
    .stroke { stroke: currentColor; fill: none; }
  </style>
  <text x="10" y="18" class="lbl">❌ Shared fixture (collision)</text>
  <rect x="10" y="28" width="220" height="70" rx="6" class="bad" opacity="0.18" stroke="#e76f51"/>
  <rect x="22" y="42" width="60" height="22" rx="3" class="bad"/>
  <text x="52" y="57" text-anchor="middle" class="lbl" fill="#fff">W1</text>
  <rect x="92" y="42" width="60" height="22" rx="3" class="bad"/>
  <text x="122" y="57" text-anchor="middle" class="lbl" fill="#fff">W2</text>
  <rect x="162" y="42" width="60" height="22" rx="3" class="bad"/>
  <text x="192" y="57" text-anchor="middle" class="lbl" fill="#fff">W3</text>
  <text x="120" y="84" text-anchor="middle" class="sub">all hit user "test@example.com"</text>
  <text x="120" y="95" text-anchor="middle" class="sub">→ logouts, conflicts</text>
  <text x="290" y="18" class="lbl">✓ Namespaced per worker</text>
  <rect x="290" y="28" width="220" height="70" rx="6" class="ok" opacity="0.18" stroke="#2a9d8f"/>
  <rect x="302" y="42" width="60" height="22" rx="3" class="ok"/>
  <text x="332" y="57" text-anchor="middle" class="lbl" fill="#fff">W1 → t1</text>
  <rect x="372" y="42" width="60" height="22" rx="3" class="ok"/>
  <text x="402" y="57" text-anchor="middle" class="lbl" fill="#fff">W2 → t2</text>
  <rect x="442" y="42" width="60" height="22" rx="3" class="ok"/>
  <text x="472" y="57" text-anchor="middle" class="lbl" fill="#fff">W3 → t3</text>
  <text x="400" y="84" text-anchor="middle" class="sub">user-\${workerIndex}-\${ts}</text>
  <text x="400" y="95" text-anchor="middle" class="sub">→ zero collisions</text>
  <text x="10" y="130" class="lbl">Isolation strategies (preferred → fallback):</text>
  <rect x="10" y="140" width="120" height="60" rx="4" class="ok" opacity="0.7"/>
  <text x="70" y="160" text-anchor="middle" class="lbl" fill="#fff">Unique IDs</text>
  <text x="70" y="176" text-anchor="middle" class="sub" fill="#fff">per test</text>
  <text x="70" y="190" text-anchor="middle" class="sub" fill="#fff">+ cleanup</text>
  <rect x="140" y="140" width="120" height="60" rx="4" class="ok" opacity="0.55"/>
  <text x="200" y="160" text-anchor="middle" class="lbl" fill="#fff">Per-worker</text>
  <text x="200" y="176" text-anchor="middle" class="sub" fill="#fff">tenant /</text>
  <text x="200" y="190" text-anchor="middle" class="sub" fill="#fff">namespace</text>
  <rect x="270" y="140" width="120" height="60" rx="4" class="warn" opacity="0.7"/>
  <text x="330" y="160" text-anchor="middle" class="lbl" fill="#222">DB tx</text>
  <text x="330" y="176" text-anchor="middle" class="sub" fill="#222">rollback</text>
  <text x="330" y="190" text-anchor="middle" class="sub" fill="#222">(rare support)</text>
  <rect x="400" y="140" width="110" height="60" rx="4" class="bad" opacity="0.55"/>
  <text x="455" y="160" text-anchor="middle" class="lbl" fill="#fff">Teardown</text>
  <text x="455" y="176" text-anchor="middle" class="sub" fill="#fff">hooks</text>
  <text x="455" y="190" text-anchor="middle" class="sub" fill="#fff">(brittle)</text>
</svg>
<div class="illus-caption">Hardcoded shared fixtures cause flakes when workers > 1. Namespace everything.</div>
</div>
<p><strong>Golden rule: every test owns its data.</strong> Strategies in order of preference:</p>
<ol>
<li><strong>Per-test unique IDs</strong> — generate via API in a fixture, prefix with <code>test-\${workerInfo.workerIndex}-\${Date.now()}</code>. Cleanup in teardown.</li>
<li><strong>Per-worker tenant</strong> — each worker gets its own test tenant.</li>
<li><strong>DB transactions</strong> — wrap each test in a transaction, rollback. Rare backend support.</li>
<li><strong>Cleanup hooks</strong> — explicit teardown. Slow, error-prone.</li>
</ol>
<p><strong>Anti-pattern:</strong> hardcoded users (<code>test@example.com</code>). Two workers hit the same login, one logs the other out. #1 cause of "works locally, fails with workers > 1".</p>`
    },
    {
      id: "ddccc787-021c-4eda-b765-f04f53306679",
      q: "Your suite has 800 tests at 40 minutes. How do you bring it under 10?",
      diff: "hard",
      tags: ["playwright", "ci", "performance"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sharding 800 tests across machines">
  <style>
    .ax { stroke: currentColor; stroke-width: 1; fill: none; opacity: 0.5; }
    .ti { font: 600 11px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 11px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .bar1 { fill: #e76f51; }
    .bar2 { fill: #e9c46a; }
    .bar3 { fill: #2a9d8f; }
  </style>
  <text x="10" y="16" class="ti">Before: 1 machine, 1 worker — 40 min</text>
  <line x1="10" y1="30" x2="510" y2="30" class="ax"/>
  <rect x="10" y="22" width="500" height="14" class="bar1"/>
  <text x="260" y="33" text-anchor="middle" class="ti" fill="#fff">800 tests serial</text>
  <text x="10" y="62" class="ti">+ API-based auth + workers: 4 — ~12 min</text>
  <line x1="10" y1="76" x2="510" y2="76" class="ax"/>
  <rect x="10" y="68" width="150" height="14" class="bar2"/>
  <text x="85" y="79" text-anchor="middle" class="ti" fill="#222">worker 1</text>
  <rect x="10" y="84" width="150" height="14" class="bar2"/>
  <text x="85" y="95" text-anchor="middle" class="ti" fill="#222">worker 2</text>
  <rect x="10" y="100" width="150" height="14" class="bar2"/>
  <text x="85" y="111" text-anchor="middle" class="ti" fill="#222">worker 3</text>
  <rect x="10" y="116" width="150" height="14" class="bar2"/>
  <text x="85" y="127" text-anchor="middle" class="ti" fill="#222">worker 4</text>
  <text x="10" y="152" class="ti">+ 4 machines × 4 workers — ~3 min wall (~8 min total)</text>
  <line x1="10" y1="166" x2="510" y2="166" class="ax"/>
  <rect x="10" y="158" width="40" height="12" class="bar3"/>
  <rect x="10" y="172" width="40" height="12" class="bar3"/>
  <rect x="60" y="158" width="40" height="12" class="bar3"/>
  <rect x="60" y="172" width="40" height="12" class="bar3"/>
  <rect x="110" y="158" width="40" height="12" class="bar3"/>
  <rect x="110" y="172" width="40" height="12" class="bar3"/>
  <rect x="160" y="158" width="40" height="12" class="bar3"/>
  <rect x="160" y="172" width="40" height="12" class="bar3"/>
  <text x="220" y="172" class="sub">↑ shard 1/4   shard 2/4   shard 3/4   shard 4/4</text>
  <text x="10" y="206" class="sub">Cost rises ~linearly with machines; wall time drops ~linearly with shards.</text>
</svg>
</div>
<ol>
<li><strong>Profile</strong> — slowest 20 tests likely take 50%+ runtime.</li>
<li><strong>API for setup</strong> — UI login: 5–15s. API login: 200ms. Use storageState.</li>
<li><strong>Shard across machines</strong> — 4 machines × <code>--shard=N/4</code> cuts wall time linearly.</li>
<li><strong>Workers per machine</strong> — 2–4, depending on backend capacity.</li>
<li><strong>Drop redundant E2E</strong> — anything covered by unit/integration.</li>
<li><strong>Cache</strong> — node_modules, browsers, build artifacts.</li>
<li><strong>Trace only on retry</strong> — saves I/O.</li>
</ol>
<p>Realistic outcome: 4 shards × 4 workers ≈ 8 min wall clock. Cost rises linearly — balance speed vs. budget.</p>`
    },
    {
      id: "3b0793b6-080c-411c-8a4f-42f74e74a7e3",
      q: "What is the Trace Viewer and how do you use it?",
      diff: "mid",
      tags: ["playwright", "debugging"],
      answer: `<div class="illus">
<svg viewBox="0 0 520 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Anatomy of a Playwright trace">
  <style>
    .ti { font: 600 11px ui-sans-serif, system-ui; fill: currentColor; }
    .sub { font: 10.5px ui-sans-serif, system-ui; fill: var(--fg-dim); }
    .box { fill: var(--bg); stroke: currentColor; stroke-width: 1; opacity: 0.9; }
    .acc { fill: #0a3d6e; }
    .ok { fill: #2a9d8f; }
    .warn { fill: #e9c46a; }
    .bad { fill: #e76f51; }
  </style>
  <rect x="6" y="6" width="508" height="228" rx="6" class="box"/>
  <rect x="6" y="6" width="508" height="22" rx="6" class="acc"/>
  <text x="14" y="22" class="ti" fill="#fff">trace.zip — show-trace</text>
  <rect x="14" y="36" width="180" height="180" rx="4" class="box"/>
  <text x="22" y="50" class="ti">Action timeline</text>
  <rect x="22" y="58" width="160" height="12" class="ok"/>
  <text x="26" y="68" class="sub" fill="#fff">goto / 320 ms</text>
  <rect x="22" y="74" width="120" height="12" class="ok"/>
  <text x="26" y="84" class="sub" fill="#fff">fill email / 80 ms</text>
  <rect x="22" y="90" width="100" height="12" class="ok"/>
  <text x="26" y="100" class="sub" fill="#fff">fill password / 80 ms</text>
  <rect x="22" y="106" width="140" height="12" class="warn"/>
  <text x="26" y="116" class="sub" fill="#222">click submit / 410 ms</text>
  <rect x="22" y="122" width="160" height="12" class="bad"/>
  <text x="26" y="132" class="sub" fill="#fff">expect dashboard ✗ TIMEOUT</text>
  <text x="22" y="158" class="sub">▸ before / after DOM</text>
  <text x="22" y="172" class="sub">▸ screenshot per action</text>
  <text x="22" y="186" class="sub">▸ source code link</text>
  <rect x="204" y="36" width="150" height="90" rx="4" class="box"/>
  <text x="212" y="50" class="ti">Network</text>
  <text x="212" y="66" class="sub">POST /login → 200</text>
  <text x="212" y="80" class="sub">GET /me → 401  ← root cause</text>
  <text x="212" y="94" class="sub">GET /assets/* → 200</text>
  <rect x="204" y="132" width="150" height="84" rx="4" class="box"/>
  <text x="212" y="146" class="ti">Console</text>
  <text x="212" y="162" class="sub">[warn] token expired</text>
  <text x="212" y="176" class="sub">[error] redirect /login</text>
  <rect x="364" y="36" width="142" height="180" rx="4" class="box"/>
  <text x="372" y="50" class="ti">DOM snapshot</text>
  <rect x="372" y="58" width="126" height="58" rx="3" fill="var(--bg-soft)" stroke="currentColor" opacity="0.7"/>
  <text x="380" y="76" class="sub">[Email]</text>
  <text x="380" y="90" class="sub">[Password]</text>
  <text x="380" y="106" class="sub">[Sign in]</text>
  <text x="372" y="138" class="ti">Source</text>
  <text x="372" y="152" class="sub">login.spec.ts:42</text>
  <text x="372" y="166" class="sub">await expect(...)</text>
  <text x="372" y="194" class="sub">Click any action →</text>
  <text x="372" y="208" class="sub">DOM travels back.</text>
</svg>
<div class="illus-caption">Each action is clickable; the right pane time-travels to that exact DOM state.</div>
</div>
<p>The Trace Viewer is Playwright's time-travel debugger. After a failed test with tracing enabled, you get a <code>.zip</code> file showing the full timeline: every action, DOM snapshot, network call, console message.</p>
<pre class="code"><code>// Enable in config
use: { trace: 'on-first-retry' }

// View locally
npx playwright show-trace trace.zip

// View from CI artifact (drag the zip onto trace.playwright.dev)</code></pre>
<p>What you see: action list with screenshots, before/after DOM, network tab with requests, console output, source code with the failing line. It's why CI failures are debuggable from your laptop.</p>`
    },
    {
      id: "421d1036-1090-4bac-b22b-837bfdd077e7",
      q: "Visual regression testing in Playwright — how do you implement it without flakes?",
      diff: "hard",
      tags: ["playwright", "visual"],
      diagram: `flowchart LR
  RUN["test run"] --> CAPT["capture screenshot<br/>(mask dynamic regions,<br/>animations off)"]
  CAPT --> EXIST{"baseline<br/>exists?"}
  EXIST -- no --> SAVE["save as baseline<br/>(test passes)"]
  EXIST -- yes --> DIFF["pixel diff<br/>vs baseline"]
  DIFF --> RATIO{"diffRatio<br/>≤ tolerance?"}
  RATIO -- yes --> PASS["test passes ✓"]
  RATIO -- no --> FAIL["fail + emit:<br/>baseline.png,<br/>actual.png,<br/>diff.png"]
  FAIL --> REV["human reviews diff"]
  REV --> CHOICE{"intended<br/>change?"}
  CHOICE -- yes --> UPD["--update-snapshots<br/>locally, commit"]
  CHOICE -- no --> BUG["file bug"]
  classDef good fill:#2a9d8f,color:#fff
  classDef bad fill:#e76f51,color:#fff
  class PASS,SAVE,UPD good
  class FAIL,BUG bad`,
      answer: `<pre class="code"><code>await expect(page).toHaveScreenshot('home.png', {
  maxDiffPixelRatio: 0.01,
  mask: [page.getByTestId('timestamp'), page.getByTestId('user-avatar')],
  animations: 'disabled',
});</code></pre>
<p><strong>Senior practices to avoid flakes:</strong></p>
<ul>
<li><strong>Mask dynamic regions</strong> — timestamps, ads, user-specific avatars.</li>
<li><strong>Disable animations</strong> at config level.</li>
<li><strong>Pin OS/browser</strong> — screenshots from macOS will differ from Linux. Run on the same OS as CI.</li>
<li><strong>Use a tolerance</strong> — <code>maxDiffPixelRatio</code>, not zero.</li>
<li><strong>Update baselines deliberately</strong> — never auto-update in CI. <code>--update-snapshots</code> locally, review the diff, commit.</li>
</ul>`
    },
    {
      id: "d626ba12-5175-4b31-a369-e9b18707f3b1",
      q: "How do you test API responses inside a Playwright test?",
      diff: "mid",
      tags: ["playwright", "api"],
      answer: `<p>Playwright includes a request context for API testing — same fixtures, same runner.</p>
<pre class="code"><code>test('hybrid: create order via API, verify in UI', async ({ page, request }) =&gt; {
  // API: create order
  const response = await request.post('/api/orders', {
    data: { sku: 'SKU-001', quantity: 2 },
    headers: { Authorization: \`Bearer \${token}\` },
  });
  expect(response.status()).toBe(201);
  const order = await response.json();

  // UI: verify it shows up
  await page.goto('/orders');
  await expect(page.getByText(order.id)).toBeVisible();
});</code></pre>
<p>Hybrid API+UI tests are faster than UI-only and cover real integration. Use API for setup, UI for the user-visible assertion.</p>`
    },
    {
      id: "cf57c72e-c6c8-428e-9e26-2df38ab7541a",
      q: "How does Playwright's Locator chaining work? Show a complex example.",
      diff: "mid",
      tags: ["playwright", "locators"],
      answer: `<p>Locators chain to scope further. Each chain narrows the search.</p>
<pre class="code"><code>// Find a specific row in a table, then a button inside
const row = page.getByRole('row').filter({ hasText: 'ORD-1234' });
await row.getByRole('button', { name: 'Cancel' }).click();

// Multiple criteria
const submitBtn = page.getByRole('button')
  .and(page.getByTitle('Submit form'));

// Exclude
const enabledBtns = page.getByRole('button').filter({ hasNot: page.getByText('Disabled') });</code></pre>
<p>Chaining preserves auto-waiting through the chain. Each scoping is lazy — re-evaluated on every action.</p>`
    },
    {
      id: "15c18646-5fc4-4e0f-90ae-e28c8e72b8df",
      q: "How do you handle a date/time picker that depends on real wall-clock time?",
      diff: "hard",
      tags: ["playwright", "time"],
      answer: `<p>Two approaches:</p>
<pre class="code"><code>// 1. Mock browser time
await page.clock.install({ time: new Date('2026-05-06T10:00:00Z') });
await page.clock.fastForward(60_000);  // jump 1 minute

// 2. Inject server-side via header (best when backend supports it)
await page.setExtraHTTPHeaders({ 'X-Mock-Time': '2026-05-06T10:00:00Z' });</code></pre>
<p><strong>Don't</strong> hardcode "today's date" in test data. Don't compare with <code>new Date()</code> in assertions — flake on midnight rollover. Always control time explicitly.</p>`
    },
    {
      id: "c548d703-50a0-47f2-b880-9691d8577db9",
      q: "How do you implement custom matchers in Playwright?",
      diff: "hard",
      tags: ["playwright", "typescript"],
      answer: `<pre class="code"><code>import { expect as baseExpect } from '@playwright/test';

export const expect = baseExpect.extend({
  async toBeVisibleInViewport(locator: Locator) {
    const isVisible = await locator.evaluate((el) =&gt; {
      const rect = el.getBoundingClientRect();
      return rect.top &gt;= 0 &amp;&amp; rect.bottom &lt;= window.innerHeight;
    });
    return {
      pass: isVisible,
      message: () =&gt; isVisible
        ? 'Expected not to be in viewport'
        : 'Expected to be in viewport',
    };
  },
});

// Usage
await expect(page.getByText('Footer')).toBeVisibleInViewport();</code></pre>
<p>Custom matchers domain-specific assertions (visible-in-viewport, has-correct-currency-format) and produce better error messages than chained generic assertions.</p>`
    },
  ]
};

const apiRest: Category = {
  id: "api-rest",
  label: "REST API testing",
  desc: "HTTP fundamentals, status codes, idempotency, schema validation, security",
  questions: [
    {
      id: "c7249af6-1cfc-4abf-85ef-bc68fede73fa",
      q: "Explain the difference between PUT, PATCH, and POST. Which are idempotent?",
      diff: "easy",
      tags: ["http", "rest"],
      diagram: `graph TB
  POST["POST /orders<br/>create new resource<br/><b>NOT idempotent</b><br/>5 calls → 5 orders"]
  PUT["PUT /orders/42<br/>replace whole resource<br/><b>Idempotent</b><br/>5 calls → same state"]
  PATCH["PATCH /orders/42<br/>partial update<br/><b>Usually idempotent</b><br/>(NOT if increment)"]
  POST ~~~ PUT ~~~ PATCH
  classDef no fill:#e76f51,color:#fff
  classDef yes fill:#2a9d8f,color:#fff
  classDef maybe fill:#e9c46a,color:#222
  class POST no
  class PUT yes
  class PATCH maybe`,
      answer: `<ul>
<li><strong>POST</strong> — create. <strong>Not idempotent</strong>: 5 POSTs create 5 resources.</li>
<li><strong>PUT</strong> — replace entirely. <strong>Idempotent</strong>: 5 PUTs leave the same final state.</li>
<li><strong>PATCH</strong> — partial update. <strong>Usually idempotent</strong> but not guaranteed (e.g., increment counter).</li>
</ul>
<p>Idempotency makes safe retries possible. Network fails mid-request → retry PUT or DELETE without fear. Retrying a POST might double-charge.</p>`
    },
    {
      id: "da3ad78f-2d88-422e-a9b8-11332ab4874d",
      q: "What's the difference between 401 and 403? If you get 500 instead, what does that mean?",
      diff: "easy",
      tags: ["http"],
      diagram: `flowchart TD
  REQ["Request arrives"] --> AUTHN{"Do I know<br/>who you are?"}
  AUTHN -->|"no token / bad token"| C401["401 Unauthorized<br/>(authentication failed)"]
  AUTHN -->|"yes"| AUTHZ{"Can you access<br/>this resource?"}
  AUTHZ -->|"no"| C403["403 Forbidden<br/>(authorization failed)"]
  AUTHZ -->|"yes"| EXISTS{"Does resource<br/>exist?"}
  EXISTS -->|"no"| C404["404 Not Found"]
  EXISTS -->|"yes"| OK["200 OK"]
  ERR["500 Internal Error"] -.->|"means auth middleware<br/>crashed — bug!"| AUTHN`,
      answer: `<ul>
<li><strong>401 Unauthorized</strong> — "I don't know who you are." Token missing/expired/invalid.</li>
<li><strong>403 Forbidden</strong> — "I know you, but you can't access this." Auth fine, authz fails.</li>
<li><strong>500</strong> when expected to be 401/403 — auth middleware threw an unhandled exception. Bug to log immediately.</li>
</ul>
<p>Some APIs return 404 instead of 403 to avoid leaking resource existence — security posture choice, not bug.</p>`
    },
    {
      id: "b9093c4c-65d6-4f6d-8079-5f90ab4ad6da",
      q: "How do you validate a REST API response beyond status code?",
      diff: "mid",
      tags: ["api", "schema"],
      diagram: `flowchart TB
  RES["HTTP response"] --> L1["1. Status code<br/>(exact, not range)"]
  L1 --> L2["2. Headers<br/>Content-Type, security, caching"]
  L2 --> L3["3. Schema<br/>JSON Schema / Zod"]
  L3 --> L4["4. Business invariants<br/>totals = sum(line items)"]
  L4 --> L5["5. Side effects<br/>GET after POST returns it"]
  L5 --> L6["6. Performance<br/>P95 within SLA"]
  L6 --> PASS["all layers ✓"]
  classDef layer fill:#0a3d6e,color:#fff
  classDef good fill:#2a9d8f,color:#fff
  class L1,L2,L3,L4,L5,L6 layer
  class PASS good`,
      answer: `<p>A status code says "the wire transaction worked". It does not say "the response is correct". Senior API tests stack six layers, each catching a distinct bug class.</p>
<ol>
<li><strong>Status code</strong> — exact value, not a range. <code>2xx</code> is meaningless; 200 vs 201 vs 204 means different things.</li>
<li><strong>Headers</strong> — <code>Content-Type</code>, caching (<code>Cache-Control</code>, <code>ETag</code>), security (<code>X-Content-Type-Options</code>, <code>Strict-Transport-Security</code>). Missing security headers ship as code-review smells.</li>
<li><strong>Schema</strong> — JSON Schema with Ajv (or Zod for type-inferred TS). Catches missing fields, wrong types, drifted extras.</li>
<li><strong>Business invariants</strong> — totals match the sum of line items, IDs match the request, currency is one of the supported set. These are what users actually see.</li>
<li><strong>Side effects</strong> — read-your-write: <code>GET</code> after <code>POST</code> returns the new resource (with eventual-consistency polling where the system documents an async window).</li>
<li><strong>Performance</strong> — p95 latency within SLA. Easy to forget; load tests catch it but per-request smoke tests can too.</li>
</ol>
<pre class="code"><code>import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true, strict: true });
const validateOrder = ajv.compile(orderSchema);

// 1 + 2 — status + headers
expect(response.status()).toBe(201);
expect(response.headers()['content-type']).toContain('application/json');
expect(response.headers()['x-content-type-options']).toBe('nosniff');

// 3 — schema. allErrors=true makes the failure message list ALL violations
const body = await response.json();
if (!validateOrder(body)) {
  throw new Error('Schema violations: ' + ajv.errorsText(validateOrder.errors));
}

// 4 — business invariants
const computedTotal = body.lineItems.reduce((s, i) =&gt; s + i.qty * i.unitPrice, 0);
expect(body.total).toBeCloseTo(computedTotal, 2);     // float tolerance
expect(body.userId).toBe(requestBody.userId);

// 6 — performance
expect(response.timings.responseEnd - response.timings.requestStart).toBeLessThan(800);</code></pre>
<h4>The eventual-consistency twist (layer 5)</h4>
<p>If the system documents that "the new order appears in <code>GET /orders/:id</code> within 200ms after <code>POST</code>", do not assert immediately — that's testing strong consistency, which isn't the contract. Use a bounded poll:</p>
<pre class="code"><code>// Eventual: poll up to 4× the documented p99 propagation window
const start = Date.now();
let fetched: Order | null = null;
while (Date.now() - start &lt; 800) {
  const r = await api.get(\`/orders/\${body.orderId}\`);
  if (r.status() === 200) { fetched = await r.json(); break; }
  await new Promise(res =&gt; setTimeout(res, 25));
}
expect(fetched).not.toBeNull();
expect(fetched!.userId).toBe(requestBody.userId);</code></pre>
<p>Without the poll, the test is flaky on a slow CI environment. With the poll, real propagation failures still fail the test inside the 800 ms window — that's the SLO turned into a gate.</p>
<h4>Senior signals</h4>
<ul>
<li>Schema validation with <code>allErrors: true</code> + <code>strict: true</code>. Strict mode catches schemas that reference undefined definitions or use deprecated keywords — a class of "the schema itself is broken" bug.</li>
<li><strong>Snapshot the response</strong> with sensitive fields scrubbed (IDs, timestamps). Diffs surface contract drift loudly without writing a new assertion per field.</li>
<li><strong>Layer 4 is the most senior</strong>. Junior tests stop at schema. Senior tests assert the math, the references, and the state-machine validity of the returned resource.</li>
</ul>
<p><strong>Anti-pattern</strong>: <code>expect(response.status()).toBeLessThan(500)</code>. That assertion passes on a 200, a 201, a 301, a 404, and any 4xx. It is functionally the assertion "we got SOMETHING back". Always assert exact status codes.</p>`
    },
    {
      id: "fa7e0336-6ab2-40a1-bc43-0fdc46fc43de",
      q: "Test authorization on a multi-tenant API: user A must not access user B's data.",
      diff: "hard",
      tags: ["security", "api"],
      diagram: `sequenceDiagram
  participant A as User A
  participant API
  participant DB
  Note over A: A has token<br/>tenant_id = T1
  A->>API: GET /orders/B-42<br/>(belongs to tenant T2)
  API->>API: AuthN — token valid? ✓
  API->>API: AuthZ — token.tenant == resource.tenant?
  alt mismatch
    API-->>A: 403 Forbidden ✓<br/>(or 404 if hiding existence)
  else 200 returned
    Note over API: BUG — IDOR<br/>tenant isolation broken
    API-->>A: 200 + B's data ✗
  end`,
      answer: `<ol>
<li><strong>Cross-tenant read</strong> — A's token requesting B's order → 403 or 404, never 200.</li>
<li><strong>Cross-tenant write</strong> — A trying to PUT/DELETE B's resource → 403.</li>
<li><strong>Role escalation</strong> — viewer attempting admin action → 403.</li>
<li><strong>Expired token</strong> → 401.</li>
<li><strong>Revoked token</strong> → 401.</li>
<li><strong>Missing scopes</strong> — token valid but lacks OAuth scope → 403.</li>
<li><strong>IDOR</strong> — sequential ID guessing must not work.</li>
<li><strong>Header tampering</strong> — <code>X-User-Id: B</code> must be ignored.</li>
</ol>
<p>Senior signal: testing the <strong>distinction between 401 and 403</strong>. Wrong code = real bug.</p>`
    },
    {
      id: "ad8660a7-639e-4d1d-850d-863bbaa3d739",
      q: "What is idempotency in HTTP and how do you implement it for a payment endpoint?",
      diff: "hard",
      tags: ["http", "patterns"],
      diagram: `sequenceDiagram
  participant C as Client
  participant API
  participant Cache as Redis (24h)
  participant PSP as Payment proc
  C->>API: POST /payments<br/>Idempotency-Key: K1
  API->>Cache: GET idem:K1
  alt no cached result
    Cache-->>API: nil
    API->>PSP: charge €50
    PSP-->>API: 201 charge_id=ch_1
    API->>Cache: SETEX idem:K1 86400 {ch_1}
    API-->>C: 201 ch_1
  else cached result (retry)
    Note over C,API: Network blip — client retries
    C->>API: POST /payments<br/>Idempotency-Key: K1
    API->>Cache: GET idem:K1
    Cache-->>API: {ch_1}
    API-->>C: 201 ch_1 (no new charge ✓)
  end`,
      answer: `<p>Client generates a unique key per logical operation, sends as header. Server caches the response keyed by ID for ~24h. Duplicate requests return the cached response without re-processing.</p>
<pre class="code"><code>// Client
POST /payments
Idempotency-Key: 7c3f2a1b-...
{ "amount": 5000, "currency": "EUR", "card": "tok_visa" }

// Server pseudocode
const cached = await redis.get(\`idem:\${key}\`);
if (cached) return cached;
const result = await processPayment(payload);
await redis.setex(\`idem:\${key}\`, 86400, result);
return result;</code></pre>
<p><strong>Test:</strong> same request twice with same key → one charge. Different keys → two charges. Stripe's API is the canonical reference.</p>`
    },
    {
      id: "c16123d4-8b97-4a87-8edd-153d1c18bcc2",
      q: "How do you test pagination on a REST API? List 5 bugs to look for.",
      diff: "mid",
      tags: ["api"],
      diagram: `graph TB
  subgraph OFFSET["Offset-based: ?page=2&size=10"]
    O1["page 1 — items 1-10"] --> O2["page 2 — items 11-20"]
    O2 --> ODRIFT["⚠ insert at row 5<br/>row 10 reappears on page 2"]
  end
  subgraph CURSOR["Cursor-based: ?after=ord_99"]
    C1["fetch 10 after start"] --> C2["next: ?after=ord_109"]
    C2 --> CSTABLE["✓ stable under inserts<br/>cursor is opaque key"]
  end`,
      answer: `<ol>
<li><strong>Off-by-one total count</strong> — server says 100, you fetch all pages, get 99 or 101.</li>
<li><strong>Duplicates across pages</strong> — unstable sort key, ties cause repeats.</li>
<li><strong>Mid-pagination mutation</strong> — new records inserted between pages cause shifts. Cursor-based pagination handles this; offset doesn't.</li>
<li><strong>Page beyond total</strong> — should be 200 with empty array, not 500.</li>
<li><strong>Invalid page_size</strong> — 0, negative, very large → should be 400 or capped, not crash.</li>
</ol>
<p>Test: first, middle, last, empty, beyond range, varying sizes, sort + paginate combos.</p>`
    },
    {
      id: "b27c915a-c51c-420d-a72a-fad511a61ca0",
      q: "How do you test rate limiting without hammering production?",
      diff: "hard",
      tags: ["api", "performance"],
      diagram: `graph LR
  T0["t=0<br/>req 1"] -->|"200"| OK1
  T1["t=1<br/>req 2-9"] -->|"200"| OK2
  T2["t=2<br/>req 10"] -->|"200<br/>(at limit)"| OK3
  T3["t=2<br/>req 11"] -->|"429 Too Many Requests<br/>Retry-After: 8"| BLOCK
  T4["t=10<br/>(window slides)"] -->|"200"| OK4
  classDef ok fill:#2a9d8f,color:#fff
  classDef bad fill:#e76f51,color:#fff
  class OK1,OK2,OK3,OK4 ok
  class BLOCK bad`,
      answer: `<pre class="code"><code>// Dedicated test environment
const limit = 10;
const responses = await Promise.all(
  Array.from({ length: limit + 1 }, () =&gt; request.get('/api/search'))
);

const limited = responses.filter(r =&gt; r.status() === 429);
expect(limited.length).toBeGreaterThanOrEqual(1);

const retryAfter = parseInt(limited[0].headers()['retry-after']);
expect(retryAfter).toBeGreaterThan(0);

await new Promise(r =&gt; setTimeout(r, retryAfter * 1000));
const recovery = await request.get('/api/search');
expect(recovery.status()).toBe(200);</code></pre>
<p>Never run rate-limit tests against prod. You'll degrade real users.</p>`
    },
    {
      id: "2e0d783b-aaa4-4416-bafe-03a42f17ff00",
      q: "What is contract testing? When do you introduce it?",
      diff: "hard",
      tags: ["api", "architecture"],
      diagram: `graph LR
  C["Consumer team<br/>(frontend)"] -->|"writes Pact tests<br/>(expected req/res)"| PACT[(Pact Broker)]
  PACT -->|"contracts"| P["Provider team<br/>(API service)"]
  P -->|"verification results"| PACT
  P -->|"can I deploy?"| PACT
  PACT -->|"yes / no — compatibility"| P`,
      answer: `<p>Contract tests (Pact) verify the consumer's expectations match the provider's API, without full E2E. Consumer defines expected requests/responses; provider replays them in their CI.</p>
<p><strong>Introduce when:</strong></p>
<ul>
<li>Microservices owned by different teams.</li>
<li>API breakages slip through E2E.</li>
<li>E2E suite is slow because it tests integration that contracts could cover.</li>
</ul>
<p><strong>Trade-off:</strong> contracts need provider buy-in. Without provider running consumer contracts in their CI, the value evaporates. It's organizational, not just tooling.</p>`
    },
    {
      id: "4c1886d0-829e-4471-a752-332b6f3b8df3",
      q: "How do you test a race condition like two users buying the last seat?",
      diff: "hard",
      tags: ["api", "concurrency"],
      diagram: `sequenceDiagram
  participant A as User A
  participant B as User B
  participant API as API
  participant DB as DB (1 seat left)
  par concurrent
    A->>API: POST /seats/42/claim
    B->>API: POST /seats/42/claim
  end
  API->>DB: SELECT...FOR UPDATE (row lock)
  DB-->>API: lock acquired (A wins)
  API-->>A: 200 OK
  API->>DB: SELECT...FOR UPDATE (B waits)
  DB-->>API: seat already claimed
  API-->>B: 409 Conflict`,
      answer: `<pre class="code"><code>test('only one user can claim the last seat', async ({ request }) =&gt; {
  const seatId = await seedAvailableSeat();

  const [resA, resB] = await Promise.all([
    request.post(\`/seats/\${seatId}/claim\`, { headers: tokenA }),
    request.post(\`/seats/\${seatId}/claim\`, { headers: tokenB }),
  ]);

  const statuses = [resA.status(), resB.status()].sort();
  expect(statuses).toEqual([200, 409]);

  const seat = await db.seats.findUnique({ where: { id: seatId } });
  expect(seat.owner).not.toBeNull();
});</code></pre>
<p>Run with <code>--repeat-each=50</code>. Single-run race tests are unreliable. Race bugs are intermittent — high-volume runs surface them.</p>`
    },
    {
      id: "f01daf19-291e-4b39-9d97-d70ec0a14153",
      q: "Walk through testing a webhook: signature, retries, idempotency.",
      diff: "hard",
      tags: ["api", "webhooks"],
      diagram: `sequenceDiagram
  participant S as Sender
  participant R as Receiver (test fixture)
  S->>R: POST /hook (event, X-Signature)
  R->>R: recompute HMAC, compare
  alt 5xx response
    R-->>S: 500
    S->>S: backoff 1m, 5m, 30m...
    S->>R: retry
  else timeout (>30s)
    R-->>S: (no response)
    S->>R: retry
  else duplicate event
    S->>R: same event_id again
    R->>R: dedupe, side effect once
    R-->>S: 200
  end`,
      answer: `<ol>
<li><strong>Local receiver</strong> — Express server in fixture, records calls.</li>
<li><strong>Trigger event</strong> — make system fire webhook.</li>
<li><strong>Verify signature</strong> — HMAC header. Recompute locally with secret, compare.</li>
<li><strong>Test retry on 5xx</strong> — return 500 from receiver. Confirm exponential backoff retries (1m, 5m, 30m, 2h, 6h typical).</li>
<li><strong>Test idempotency</strong> — send same event twice (same event ID). Side effect happens once.</li>
<li><strong>Verify timeout behavior</strong> — receiver takes 30s. Sender treats as failure, retries.</li>
</ol>`
    },
    {
      id: "8a63699e-18e2-4a6a-820d-527e50b12945",
      q: "What is JSON Schema validation and why is it more reliable than spot-checking fields?",
      diff: "mid",
      tags: ["api", "schema"],
      diagram: `flowchart LR
  R["API response"] --> V["JSON Schema validator<br/>(Ajv / Zod)"]
  V --> M{"matches<br/>schema?"}
  M -- yes --> P["passes ✓<br/>+ all spot checks subsumed"]
  M -- no --> F["fails fast with reason:"]
  F --> F1["missing field"]
  F --> F2["wrong type<br/>(string vs number)"]
  F --> F3["enum violation"]
  F --> F4["extra field<br/>(additionalProperties: false)"]
  classDef good fill:#2a9d8f,color:#fff
  classDef bad fill:#e76f51,color:#fff
  class P good
  class F,F1,F2,F3,F4 bad`,
      answer: `<p>JSON Schema describes structure, types, and constraints. Tools like Ajv/Zod compile it to a validator.</p>
<p><strong>Why it beats spot-checking:</strong></p>
<ul>
<li>Catches <strong>missing fields</strong> you forgot to assert on.</li>
<li>Catches <strong>type drift</strong> — backend changes price from number to string, 50 spot tests still pass while production breaks.</li>
<li>Catches <strong>extra fields</strong> with <code>additionalProperties: false</code> — security (no info leaks).</li>
<li>One assertion replaces dozens.</li>
</ul>
<pre class="code"><code>const orderSchema = {
  type: 'object',
  required: ['id', 'total', 'currency', 'items'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    total: { type: 'number', minimum: 0 },
    currency: { type: 'string', enum: ['EUR', 'USD', 'GBP'] },
    items: { type: 'array', minItems: 1 },
  },
  additionalProperties: false,
};</code></pre>`
    },
    {
      id: "1c112ddb-eb7a-4095-90e9-69adf8e41648",
      q: "How do you test an API for SQL injection?",
      diff: "hard",
      tags: ["api", "security"],
      answer: `<p>SQL injection happens when user input is concatenated into queries. Test by sending crafted payloads:</p>
<pre class="code"><code>// Classic
GET /users?email=admin@test.com'%20OR%20'1'='1

// Tautology
POST /login
{ "email": "admin' --", "password": "anything" }

// Time-based (blind)
GET /users?id=1;%20WAITFOR%20DELAY%20'00:00:05'</code></pre>
<p>Expected: server rejects with 400 or sanitizes input. Red flags: 500 errors with SQL exception messages in the response (information leak), unexpected 200 responses, response time spikes (blind injection).</p>
<p>This is QA + security overlap. Coordinate with the security team — never run injection tests against production without authorization.</p>`
    },
    {
      id: "e145c41c-5036-4f16-b58f-785cc8651634",
      q: "What is OAuth 2.0 and how do you test an OAuth flow?",
      diff: "hard",
      tags: ["security", "auth"],
      diagram: `sequenceDiagram
  participant U as User
  participant A as App (client)
  participant AS as Auth Server
  participant API as Resource API
  U->>A: Click "Log in"
  A->>AS: /authorize (client_id, code_challenge, scopes)
  AS->>U: Login + consent
  U->>AS: Approve
  AS-->>A: redirect with auth code
  A->>AS: /token (code + code_verifier)
  AS-->>A: access_token + refresh_token
  A->>API: GET /me  (Bearer access_token)
  API-->>A: 200 user data`,
      answer: `<p>OAuth 2.0 is an authorization framework. The user authorizes an app to access resources on their behalf without sharing credentials. Most common flow: <strong>Authorization Code with PKCE</strong>.</p>
<ol>
<li>App redirects user to authorization server.</li>
<li>User logs in, consents to scopes.</li>
<li>Auth server redirects back with an authorization code.</li>
<li>App exchanges code (+ PKCE verifier) for access token.</li>
<li>App calls API with <code>Authorization: Bearer &lt;token&gt;</code>.</li>
</ol>
<p><strong>Testing without testing the IdP itself:</strong> mock the authorization server in tests, or use a local Keycloak/Hydra in Docker. Inject a known JWT directly. Test your app's: token validation, refresh flow, expiry handling, scope enforcement. Don't re-test Google's login UI — that's their job.</p>`
    },
  ]
};

export const PART_1_CATEGORIES: Category[] = [playwrightTS, apiRest];
