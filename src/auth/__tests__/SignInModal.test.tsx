import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignInModal } from "../SignInModal";

// Stub useAuth so the modal can be tested without provider plumbing.
const mockUseAuth = vi.fn();
vi.mock("../AuthContext", () => ({
  useAuth: () => mockUseAuth(),
  PASSWORD_MIN_LENGTH: 8,
}));

beforeEach(() => {
  mockUseAuth.mockReset();
});

function defaultAuth(overrides: Partial<ReturnType<typeof makeAuth>> = {}) {
  return { ...makeAuth(), ...overrides };
}
function makeAuth() {
  return {
    status: "anonymous" as "anonymous" | "authenticated" | "loading",
    user: null,
    session: null,
    isRecovery: false,
    signIn: vi.fn().mockResolvedValue({ ok: true }),
    signUp: vi.fn().mockResolvedValue({ ok: true }),
    signOut: vi.fn(),
    resetPassword: vi.fn().mockResolvedValue({ ok: true }),
    updatePassword: vi.fn().mockResolvedValue({ ok: true }),
    clearRecovery: vi.fn(),
  };
}

describe("SignInModal", () => {
  it("renders nothing when closed", () => {
    mockUseAuth.mockReturnValue(defaultAuth());
    const { container } = render(
      <SignInModal open={false} onClose={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the sign-in form by default", () => {
    mockUseAuth.mockReturnValue(defaultAuth());
    render(<SignInModal open onClose={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("calls signIn with the entered credentials", async () => {
    const auth = defaultAuth();
    mockUseAuth.mockReturnValue(auth);
    render(<SignInModal open onClose={() => {}} />);

    await userEvent.type(screen.getByLabelText(/email/i), "foo@bar.com");
    await userEvent.type(screen.getByLabelText(/password/i), "supersecret");
    await userEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(auth.signIn).toHaveBeenCalledWith("foo@bar.com", "supersecret");
  });

  it("shows the error returned from signIn", async () => {
    const auth = defaultAuth({
      signIn: vi
        .fn()
        .mockResolvedValue({ ok: false, error: "Invalid email or password." }),
    });
    mockUseAuth.mockReturnValue(auth);
    render(<SignInModal open onClose={() => {}} />);

    await userEvent.type(screen.getByLabelText(/email/i), "foo@bar.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByText(/invalid email or password/i),
    ).toBeInTheDocument();
  });

  it("switches to sign-up mode and calls signUp", async () => {
    const auth = defaultAuth();
    mockUseAuth.mockReturnValue(auth);
    render(<SignInModal open onClose={() => {}} />);

    await userEvent.click(screen.getByRole("tab", { name: /sign up/i }));
    expect(
      screen.getByRole("heading", { name: /create an account/i }),
    ).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/email/i), "new@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "longenough");
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i }),
    );

    expect(auth.signUp).toHaveBeenCalledWith("new@example.com", "longenough");
  });

  it("shows a confirmation message when sign-up reports needsConfirmation", async () => {
    const auth = defaultAuth({
      signUp: vi
        .fn()
        .mockResolvedValue({ ok: true, needsConfirmation: true }),
    });
    mockUseAuth.mockReturnValue(auth);
    render(<SignInModal open onClose={() => {}} />);

    await userEvent.click(screen.getByRole("tab", { name: /sign up/i }));
    await userEvent.type(screen.getByLabelText(/email/i), "new@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "longenough");
    await userEvent.click(
      screen.getByRole("button", { name: /create account/i }),
    );
    expect(
      await screen.findByText(/check new@example.com for a confirmation link/i),
    ).toBeInTheDocument();
  });

  it("switches to reset-password mode and hides the password field", async () => {
    mockUseAuth.mockReturnValue(defaultAuth());
    render(<SignInModal open onClose={() => {}} />);
    await userEvent.click(
      screen.getByRole("button", { name: /forgot your password/i }),
    );
    expect(
      screen.getByRole("heading", { name: /reset your password/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument();
  });

  it("auto-closes once status flips to authenticated", async () => {
    mockUseAuth.mockReturnValue(defaultAuth({ status: "authenticated" }));
    const onClose = vi.fn();
    render(<SignInModal open onClose={onClose} />);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("closes when Continue as guest is clicked", async () => {
    mockUseAuth.mockReturnValue(defaultAuth());
    const onClose = vi.fn();
    render(<SignInModal open onClose={onClose} />);
    await userEvent.click(
      screen.getByRole("button", { name: /continue as guest/i }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("shows the 'set a new password' UI when isRecovery is true", () => {
    mockUseAuth.mockReturnValue(
      defaultAuth({ isRecovery: true, status: "authenticated" }),
    );
    render(<SignInModal open onClose={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /set a new password/i }),
    ).toBeInTheDocument();
    // Email is hidden; sign-in/up tabs are hidden; guest link is hidden.
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /continue as guest/i }),
    ).not.toBeInTheDocument();
    // Use placeholder to disambiguate from the dialog's aria-labelledby
    // (which also matches /new password/i via the heading).
    expect(screen.getByPlaceholderText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it("calls updatePassword and clearRecovery after a successful recovery submit", async () => {
    const auth = defaultAuth({ isRecovery: true, status: "authenticated" });
    mockUseAuth.mockReturnValue(auth);
    const onClose = vi.fn();
    render(<SignInModal open onClose={onClose} />);

    await userEvent.type(
      screen.getByPlaceholderText(/at least 8 characters/i),
      "newlongpass",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /update password/i }),
    );

    expect(auth.updatePassword).toHaveBeenCalledWith("newlongpass");
    // SignInModal defers the close by 1200ms so the user reads the success
    // message — give waitFor enough time to clear that.
    await waitFor(() => expect(auth.clearRecovery).toHaveBeenCalled(), {
      timeout: 2000,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("does not auto-close on authenticated while isRecovery is true", () => {
    mockUseAuth.mockReturnValue(
      defaultAuth({ status: "authenticated", isRecovery: true }),
    );
    const onClose = vi.fn();
    render(<SignInModal open onClose={onClose} />);
    expect(onClose).not.toHaveBeenCalled();
  });
});
