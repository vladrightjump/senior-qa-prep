import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

interface UserMenuProps {
  onSignInClick: () => void;
}

function initials(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase() || "?";
}

const DELETE_CONFIRM_PHRASE = "delete my account";

export function UserMenu({ onSignInClick }: UserMenuProps) {
  const { status, user, signOut, deleteAccount } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", click);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("mousedown", click);
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  if (status === "loading") {
    return <div className="user-chip user-chip-loading" aria-hidden />;
  }

  if (status === "anonymous" || !user) {
    return (
      <button
        className="pill-btn"
        onClick={onSignInClick}
        title="Sign in to sync your progress"
      >
        ✱ <span className="pill-btn-label">Sign in</span>
      </button>
    );
  }

  const email = user.email ?? "user";

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        className="user-chip"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={email}
      >
        <span className="user-chip-avatar" aria-hidden>
          {initials(email)}
        </span>
        <span className="user-chip-email">{email}</span>
      </button>
      {open && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-email">{email}</div>
          <button
            className="user-menu-item"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut(false);
            }}
          >
            Sign out
          </button>
          <button
            className="user-menu-item"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut(true);
            }}
            title="Revoke all active sessions"
          >
            Sign out everywhere
          </button>
          <button
            className="user-menu-item user-menu-item-danger"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setDeleteInput("");
              setDeleteError(null);
              setConfirmingDelete(true);
            }}
          >
            Delete account…
          </button>
        </div>
      )}
      {confirmingDelete && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={() => !deleting && setConfirmingDelete(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="delete-account-title" className="modal-title">
              Delete account
            </h2>
            <p className="modal-lead">
              This permanently removes your account and all synced data
              (reviewed questions, flags, notes). This cannot be undone.
            </p>
            <p className="modal-lead">
              Type <strong>{DELETE_CONFIRM_PHRASE}</strong> to confirm.
            </p>
            <input
              className="auth-field"
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder={DELETE_CONFIRM_PHRASE}
              disabled={deleting}
              autoFocus
            />
            {deleteError && (
              <div className="auth-alert auth-alert-error" role="alert">
                {deleteError}
              </div>
            )}
            <div className="auth-footer">
              <button
                type="button"
                className="auth-link"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-cta modal-cta-danger"
                disabled={
                  deleting || deleteInput.trim() !== DELETE_CONFIRM_PHRASE
                }
                onClick={async () => {
                  setDeleting(true);
                  setDeleteError(null);
                  const r = await deleteAccount();
                  setDeleting(false);
                  if (!r.ok) {
                    setDeleteError(r.error ?? "Failed to delete account.");
                    return;
                  }
                  setConfirmingDelete(false);
                }}
              >
                {deleting ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
