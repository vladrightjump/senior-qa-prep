import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // RLS policies on the qa_flags / qa_comments tables limit the anon key's
  // blast radius; they're safe to ship in the bundle but must be set.
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill them in.",
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    // PKCE flow: best practice for SPAs — auth code is exchanged for tokens
    // using a one-time code_verifier, mitigating interception attacks.
    flowType: "pkce",
    // Persist the session in localStorage so refresh / new tabs keep the user
    // signed in. Supabase tokens are short-lived JWTs; the refresh token is
    // automatically rotated by the SDK.
    persistSession: true,
    autoRefreshToken: true,
    // Required for email-confirmation and password-reset redirects to land
    // back on the app and complete the exchange.
    detectSessionInUrl: true,
  },
});
