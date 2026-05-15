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

export function UserMenu({ onSignInClick }: UserMenuProps) {
  const { status, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
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
        </div>
      )}
    </div>
  );
}
