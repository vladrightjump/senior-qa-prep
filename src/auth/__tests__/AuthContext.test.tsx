import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { AuthProvider, useAuth } from "../AuthContext";

// In-memory Supabase auth mock — captures calls and lets us drive the
// onAuthStateChange subscription from tests.
type Handler = (event: string, session: Session | null) => void;
const state: {
  session: Session | null;
  handlers: Handler[];
  signInWithPassword: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  resetPasswordForEmail: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
} = {
  session: null,
  handlers: [],
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
};

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: state.session } })),
      onAuthStateChange: (cb: Handler) => {
        state.handlers.push(cb);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                state.handlers = state.handlers.filter((h) => h !== cb);
              },
            },
          },
        };
      },
      signInWithPassword: (...args: unknown[]) =>
        (state.signInWithPassword as (...a: unknown[]) => unknown)(...args),
      signUp: (...args: unknown[]) =>
        (state.signUp as (...a: unknown[]) => unknown)(...args),
      signOut: (...args: unknown[]) =>
        (state.signOut as (...a: unknown[]) => unknown)(...args),
      resetPasswordForEmail: (...args: unknown[]) =>
        (state.resetPasswordForEmail as (...a: unknown[]) => unknown)(...args),
      updateUser: (...args: unknown[]) =>
        (state.updateUser as (...a: unknown[]) => unknown)(...args),
    },
  },
}));

function emit(event: string, session: Session | null) {
  state.session = session;
  for (const h of state.handlers) h(event, session);
}

function makeSession(email = "u@example.com"): Session {
  return {
    access_token: "a",
    refresh_token: "r",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "user-1",
      email,
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    },
  } as unknown as Session;
}

function Probe() {
  const { status, user, isRecovery } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="email">{user?.email ?? "none"}</span>
      <span data-testid="recovery">{isRecovery ? "yes" : "no"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    state.session = null;
    state.handlers = [];
    state.signInWithPassword.mockReset();
    state.signUp.mockReset();
    state.signOut.mockReset();
    state.resetPasswordForEmail.mockReset();
    state.updateUser.mockReset();
  });

  it("starts in loading, then resolves to anonymous when no session exists", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByTestId("status").textContent).toBe("loading");
    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("anonymous"),
    );
  });

  it("becomes authenticated when a session is emitted", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("anonymous"),
    );
    act(() => emit("SIGNED_IN", makeSession("alice@example.com")));
    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("authenticated"),
    );
    expect(screen.getByTestId("email").textContent).toBe("alice@example.com");
  });

  it("returns to anonymous on sign-out", async () => {
    state.session = makeSession();
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("authenticated"),
    );
    act(() => emit("SIGNED_OUT", null));
    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("anonymous"),
    );
  });

  it("useAuth throws when used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/AuthProvider/);
    spy.mockRestore();
  });

  it("signIn normalizes the Supabase 'invalid login' error without leaking which field is wrong", async () => {
    state.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    function CallSignIn() {
      const { signIn } = useAuth();
      return (
        <button
          onClick={async () => {
            const r = await signIn("foo@bar.com", "wrong");
            (window as unknown as { __r: unknown }).__r = r;
          }}
        >
          go
        </button>
      );
    }

    render(
      <AuthProvider>
        <CallSignIn />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(state.signInWithPassword).not.toHaveBeenCalled(),
    );

    await userEvent.click(screen.getByText("go"));
    await waitFor(() =>
      expect((window as unknown as { __r: { ok: boolean; error: string } }).__r).toBeDefined(),
    );
    const r = (window as unknown as { __r: { ok: boolean; error: string } })
      .__r;
    expect(r.ok).toBe(false);
    expect(r.error).toBe("Invalid email or password.");
  });

  it("signUp rejects passwords shorter than the minimum without calling Supabase", async () => {
    function CallSignUp() {
      const { signUp } = useAuth();
      return (
        <button
          onClick={async () => {
            const r = await signUp("foo@bar.com", "short");
            (window as unknown as { __r: unknown }).__r = r;
          }}
        >
          go
        </button>
      );
    }
    render(
      <AuthProvider>
        <CallSignUp />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("go"));
    const r = (window as unknown as { __r: { ok: boolean; error: string } })
      .__r;
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/at least 12/);
    expect(state.signUp).not.toHaveBeenCalled();
  });

  it("signUp rejects passwords that lack complexity", async () => {
    function CallSignUp() {
      const { signUp } = useAuth();
      return (
        <button
          onClick={async () => {
            // 12+ chars but only one character class
            const r = await signUp("foo@bar.com", "aaaaaaaaaaaaaa");
            (window as unknown as { __r: unknown }).__r = r;
          }}
        >
          go
        </button>
      );
    }
    render(
      <AuthProvider>
        <CallSignUp />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("go"));
    const r = (window as unknown as { __r: { ok: boolean; error: string } })
      .__r;
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/mix/i);
    expect(state.signUp).not.toHaveBeenCalled();
  });

  it("signUp reports needsConfirmation when Supabase returns no session", async () => {
    state.signUp.mockResolvedValue({ data: { session: null }, error: null });
    function Call() {
      const { signUp } = useAuth();
      return (
        <button
          onClick={async () => {
            const r = await signUp("foo@bar.com", "LongEnough1!");
            (window as unknown as { __r: unknown }).__r = r;
          }}
        >
          go
        </button>
      );
    }
    render(
      <AuthProvider>
        <Call />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("go"));
    await waitFor(() =>
      expect(
        (window as unknown as { __r: { ok: boolean; needsConfirmation: boolean } })
          .__r,
      ).toBeDefined(),
    );
    const r = (
      window as unknown as { __r: { ok: boolean; needsConfirmation: boolean } }
    ).__r;
    expect(r.ok).toBe(true);
    expect(r.needsConfirmation).toBe(true);
  });

  it("flips isRecovery on PASSWORD_RECOVERY and clears it after updatePassword succeeds", async () => {
    state.updateUser.mockResolvedValue({ data: { user: {} }, error: null });
    function Call() {
      const { updatePassword, isRecovery } = useAuth();
      return (
        <>
          <span data-testid="recovery">{isRecovery ? "yes" : "no"}</span>
          <button
            onClick={async () => {
              const r = await updatePassword("NewLongPass1!");
              (window as unknown as { __r: unknown }).__r = r;
            }}
          >
            go
          </button>
        </>
      );
    }
    render(
      <AuthProvider>
        <Call />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("recovery").textContent).toBe("no"),
    );
    act(() => emit("PASSWORD_RECOVERY", makeSession()));
    await waitFor(() =>
      expect(screen.getByTestId("recovery").textContent).toBe("yes"),
    );
    await userEvent.click(screen.getByText("go"));
    await waitFor(() =>
      expect(screen.getByTestId("recovery").textContent).toBe("no"),
    );
    expect(state.updateUser).toHaveBeenCalledWith({ password: "NewLongPass1!" });
    const r = (window as unknown as { __r: { ok: boolean } }).__r;
    expect(r.ok).toBe(true);
  });

  it("updatePassword rejects short passwords without calling Supabase", async () => {
    function Call() {
      const { updatePassword } = useAuth();
      return (
        <button
          onClick={async () => {
            const r = await updatePassword("short");
            (window as unknown as { __r: unknown }).__r = r;
          }}
        >
          go
        </button>
      );
    }
    render(
      <AuthProvider>
        <Call />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("go"));
    const r = (window as unknown as { __r: { ok: boolean; error: string } })
      .__r;
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/at least 12/);
    expect(state.updateUser).not.toHaveBeenCalled();
  });

  it("signOut passes the global scope when called with everywhere=true", async () => {
    state.signOut.mockResolvedValue({ error: null });
    function Call() {
      const { signOut } = useAuth();
      return <button onClick={() => signOut(true)}>go</button>;
    }
    render(
      <AuthProvider>
        <Call />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("go"));
    expect(state.signOut).toHaveBeenCalledWith({ scope: "global" });
  });
});
