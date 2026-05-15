import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface AuthResult {
  ok: boolean;
  error?: string;
  needsConfirmation?: boolean;
}

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  // True while completing a "forgot password" email flow. Supabase emits
  // PASSWORD_RECOVERY on the click-through from the reset email; the UI
  // should prompt the user to set a new password and call updatePassword().
  isRecovery: boolean;
  signIn: (
    email: string,
    password: string,
    captchaToken?: string,
  ) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    captchaToken?: string,
  ) => Promise<AuthResult>;
  signOut: (everywhere?: boolean) => Promise<void>;
  resetPassword: (email: string, captchaToken?: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  clearRecovery: () => void;
  deleteAccount: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Password policy enforced client-side; the canonical rule still lives in
// Supabase Auth settings (Auth → Policies → Password requirements). Bumped
// to 12 to roughly align with current NIST guidance for user-chosen secrets.
export const PASSWORD_MIN_LENGTH = 12;

// Returns null on success or a human-readable reason on failure. Requires
// at least 3 of {lowercase, uppercase, digit, symbol} in addition to the
// minimum length, which kills the most common weak-password patterns
// without forcing the user to follow any specific composition rule.
export function assessPassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  if (classes < 3) {
    return "Password must mix at least 3 of: lowercase, uppercase, digits, symbols.";
  }
  return null;
}

function normalizeError(message: string | undefined): string {
  if (!message) return "Something went wrong. Please try again.";
  const m = message.toLowerCase();
  // Don't leak whether the email exists — same message for wrong password
  // and unknown email. Mirrors Supabase's "Invalid login credentials".
  if (m.includes("invalid login")) return "Invalid email or password.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email before signing in.";
  if (m.includes("rate") || m.includes("too many"))
    return "Too many attempts. Please wait a minute and try again.";
  return message;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [isRecovery, setIsRecovery] = useState(false);

  // Bootstrap: read any persisted session, then subscribe to changes
  // (sign-in / sign-out / token refresh / password recovery).
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setStatus(data.session ? "authenticated" : "anonymous");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setStatus(newSession ? "authenticated" : "anonymous");
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password, captchaToken) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });
      if (error) return { ok: false, error: normalizeError(error.message) };
      return { ok: true };
    },
    [],
  );

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async (email, password, captchaToken) => {
      const policy = assessPassword(password);
      if (policy) return { ok: false, error: policy };
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
          captchaToken,
        },
      });
      if (error) return { ok: false, error: normalizeError(error.message) };
      // When "Confirm email" is on in Supabase, session is null until the
      // user clicks the confirmation link.
      return { ok: true, needsConfirmation: !data.session };
    },
    [],
  );

  const signOut = useCallback<AuthContextValue["signOut"]>(
    async (everywhere = false) => {
      await supabase.auth.signOut({ scope: everywhere ? "global" : "local" });
    },
    [],
  );

  const resetPassword = useCallback<AuthContextValue["resetPassword"]>(
    async (email, captchaToken) => {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/?recovery=1`
              : undefined,
          captchaToken,
        },
      );
      if (error) return { ok: false, error: normalizeError(error.message) };
      return { ok: true };
    },
    [],
  );

  const updatePassword = useCallback<AuthContextValue["updatePassword"]>(
    async (newPassword) => {
      const policy = assessPassword(newPassword);
      if (policy) return { ok: false, error: policy };
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) return { ok: false, error: normalizeError(error.message) };
      setIsRecovery(false);
      return { ok: true };
    },
    [],
  );

  const clearRecovery = useCallback(() => setIsRecovery(false), []);

  // Calls the `delete-account` Edge Function which verifies the caller's JWT
  // server-side and uses the service-role key to remove the auth user. On
  // success we sign out so the dead session doesn't linger in localStorage.
  const deleteAccount = useCallback<AuthContextValue["deleteAccount"]>(
    async () => {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) {
        return {
          ok: false,
          error: normalizeError(error.message ?? "Account deletion failed."),
        };
      }
      await supabase.auth.signOut({ scope: "global" });
      return { ok: true };
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      session,
      isRecovery,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      clearRecovery,
      deleteAccount,
    }),
    [
      status,
      session,
      isRecovery,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      clearRecovery,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
