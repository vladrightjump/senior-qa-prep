import { useEffect, useState } from "react";
import { useAuth, PASSWORD_MIN_LENGTH } from "./AuthContext";
import { getCaptchaToken, isCaptchaConfigured } from "./captcha";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "signin" | "signup" | "reset" | "update-password";

export function SignInModal({ open, onClose }: SignInModalProps) {
  const {
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    clearRecovery,
    status,
    isRecovery,
  } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Recovery flow: lock the modal into the update-password mode whenever the
  // user clicks through from a reset email. Don't auto-close just because
  // there's a session — they're signed in but need to set a new password.
  useEffect(() => {
    if (isRecovery) {
      setMode("update-password");
      setError(null);
      setInfo(null);
    }
  }, [isRecovery]);

  // Auto-close once the user is signed in (unless we're mid-recovery).
  useEffect(() => {
    if (open && status === "authenticated" && !isRecovery) {
      onClose();
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, status, isRecovery]);

  // Reset transient form state every time the modal closes so the next open
  // starts on the sign-in tab with empty fields, not whatever the user typed
  // last time.
  useEffect(() => {
    if (!open) {
      reset();
      setMode(isRecovery ? "update-password" : "signin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  function reset() {
    setEmail("");
    setPassword("");
    setError(null);
    setInfo(null);
    setBusy(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (mode !== "update-password" && !email) {
      setError("Email is required.");
      return;
    }
    setBusy(true);
    try {
      // Fetch a fresh Turnstile token per submit. Tokens are single-use and
      // short-lived, so we always reset between attempts. When the site key
      // is not configured (dev) this is a no-op and resolves to undefined.
      const captchaToken =
        mode !== "update-password" && isCaptchaConfigured()
          ? await getCaptchaToken()
          : undefined;
      if (
        mode !== "update-password" &&
        isCaptchaConfigured() &&
        !captchaToken
      ) {
        setError("Couldn't verify you're human. Please try again.");
        return;
      }
      if (mode === "signin") {
        const r = await signIn(email, password, captchaToken);
        if (!r.ok) setError(r.error ?? "Sign-in failed.");
      } else if (mode === "signup") {
        const r = await signUp(email, password, captchaToken);
        if (!r.ok) setError(r.error ?? "Sign-up failed.");
        else if (r.needsConfirmation) {
          setInfo(`Check ${email} for a confirmation link.`);
        }
      } else if (mode === "reset") {
        const r = await resetPassword(email, captchaToken);
        if (!r.ok) setError(r.error ?? "Reset failed.");
        else setInfo(`If an account exists for ${email}, a reset link is on its way.`);
      } else {
        // update-password
        const r = await updatePassword(password);
        if (!r.ok) setError(r.error ?? "Update failed.");
        else {
          setInfo("Password updated. You're all set.");
          // Close shortly so the user reads the confirmation.
          setTimeout(() => {
            clearRecovery();
            onClose();
          }, 1200);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  const title =
    mode === "signin"
      ? "Sign in"
      : mode === "signup"
        ? "Create an account"
        : mode === "reset"
          ? "Reset your password"
          : "Set a new password";

  const submitLabel =
    mode === "signin"
      ? "Sign in"
      : mode === "signup"
        ? "Create account"
        : mode === "reset"
          ? "Send reset link"
          : "Update password";

  const showEmail = mode !== "update-password";
  const showPassword = mode !== "reset";
  const showTabs = mode === "signin" || mode === "signup";
  const showFooterLinks = mode !== "update-password";

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="modal auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close sign-in"
          title="Close (Esc)"
        >
          ✕
        </button>
        <h2 id="auth-modal-title" className="modal-title">
          {title}
        </h2>
        <p className="modal-lead">
          {mode === "update-password"
            ? "Choose a new password for your account. You'll stay signed in afterwards."
            : "Sync your reviewed questions, flags, and notes across devices. Your local progress stays untouched if you continue as a guest."}
        </p>

        {showTabs && (
          <div className="auth-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={mode === "signin"}
              className={`auth-tab ${mode === "signin" ? "active" : ""}`}
              onClick={() => switchMode("signin")}
            >
              Sign in
            </button>
            <button
              role="tab"
              aria-selected={mode === "signup"}
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => switchMode("signup")}
            >
              Sign up
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={submit} noValidate>
          {showEmail && (
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={busy}
              />
            </label>
          )}

          {showPassword && (
            <label className="auth-field">
              <span>{mode === "update-password" ? "New password" : "Password"}</span>
              <input
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
                minLength={PASSWORD_MIN_LENGTH}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
                disabled={busy}
              />
            </label>
          )}

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              {error}
            </div>
          )}
          {info && (
            <div className="auth-alert auth-alert-info" role="status">
              {info}
            </div>
          )}

          <button type="submit" className="modal-cta" disabled={busy}>
            {busy ? "Working…" : submitLabel}
          </button>
        </form>

        {showFooterLinks && (
          <div className="auth-footer">
            {mode === "signin" && (
              <button
                type="button"
                className="auth-link"
                onClick={() => switchMode("reset")}
              >
                Forgot your password?
              </button>
            )}
            {mode === "reset" && (
              <button
                type="button"
                className="auth-link"
                onClick={() => switchMode("signin")}
              >
                ← Back to sign in
              </button>
            )}
            <button
              type="button"
              className="auth-link auth-link-muted"
              onClick={onClose}
            >
              Continue as guest (local-only)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
