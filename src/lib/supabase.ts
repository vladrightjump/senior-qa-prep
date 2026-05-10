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
  auth: { persistSession: false },
});
