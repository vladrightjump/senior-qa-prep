// Cloudflare Turnstile loader.
//
// If VITE_TURNSTILE_SITE_KEY is unset (typical for local dev), getCaptchaToken
// resolves to `undefined` and the Supabase auth endpoints will be called
// without a captcha token. In production, set the env var AND enable
// "CAPTCHA protection" in Supabase Auth → Settings so the server actually
// enforces it; otherwise the token is just decoration.

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      size?: "normal" | "compact" | "invisible";
      callback?: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
  execute: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadScript(): Promise<TurnstileApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile requires a browser"));
  }
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile script loaded without API"));
    };
    s.onerror = () => reject(new Error("Failed to load Turnstile script"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function isCaptchaConfigured(): boolean {
  return Boolean(SITE_KEY);
}

// Renders an invisible Turnstile widget and resolves to a token. Returns
// undefined if no site key is configured (dev/local path) so callers can
// proceed unconditionally without branching at every call site.
export async function getCaptchaToken(): Promise<string | undefined> {
  if (!SITE_KEY) return undefined;
  const api = await loadScript();

  const host = document.createElement("div");
  host.style.position = "absolute";
  host.style.left = "-9999px";
  host.style.top = "-9999px";
  host.setAttribute("aria-hidden", "true");
  document.body.appendChild(host);

  return new Promise<string | undefined>((resolve) => {
    let widgetId: string | null = null;
    const cleanup = () => {
      try {
        if (widgetId) api.remove(widgetId);
      } catch {
        /* ignore */
      }
      host.remove();
    };
    widgetId = api.render(host, {
      sitekey: SITE_KEY,
      size: "invisible",
      callback: (token) => {
        cleanup();
        resolve(token);
      },
      "error-callback": () => {
        cleanup();
        resolve(undefined);
      },
      "expired-callback": () => {
        cleanup();
        resolve(undefined);
      },
    });
    try {
      api.execute(widgetId);
    } catch {
      cleanup();
      resolve(undefined);
    }
  });
}
