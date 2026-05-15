import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { HelpModal } from "../HelpModal";

describe("HelpModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<HelpModal open={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title, features, and shortcut grid when open", () => {
    render(<HelpModal open onClose={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /welcome to qa interview prep/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Knowledge Galaxy/i)).toBeInTheDocument();
    expect(screen.getByText(/Keyboard shortcuts/i)).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<HelpModal open onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /close help/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the CTA is clicked", async () => {
    const onClose = vi.fn();
    render(<HelpModal open onClose={onClose} />);
    await userEvent.click(
      screen.getByRole("button", { name: /let's study/i }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when the backdrop is clicked but not when the modal body is clicked", async () => {
    const onClose = vi.fn();
    render(<HelpModal open onClose={onClose} />);
    await userEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    await userEvent.click(
      screen.getByRole("heading", { name: /welcome/i }),
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on Escape key", async () => {
    const onClose = vi.fn();
    render(<HelpModal open onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
