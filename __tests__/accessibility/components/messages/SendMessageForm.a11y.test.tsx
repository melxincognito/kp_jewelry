import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SendMessageForm } from "@/components/messages/SendMessageForm";

// WCAG references:
//   1.3.1 Info and Relationships — textarea has a label
//   4.1.2 Name, Role, Value — submit button has accessible name
//   4.1.3 Status Messages — success message uses aria-live so it's announced

describe("SendMessageForm – accessibility (WCAG 2.1)", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as jest.Mock;
  });

  it("has no axe violations in the default (form) state", async () => {
    const { container } = render(
      <SendMessageForm productId="p1" recipientId="u1" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the sent (success) state", async () => {
    const user = userEvent.setup();
    render(<SendMessageForm productId="p1" recipientId="u1" />);

    await user.type(screen.getByLabelText(/message to seller/i), "Is this still available?");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    // Wait for the sent state to appear
    await screen.findByRole("status");
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("textarea has a programmatic label (WCAG 1.3.1)", () => {
    render(<SendMessageForm productId="p1" recipientId="u1" />);
    expect(screen.getByLabelText(/message to seller/i)).toBeInTheDocument();
  });

  it("send button has an accessible name (WCAG 4.1.2)", () => {
    render(<SendMessageForm productId="p1" recipientId="u1" />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("send button is disabled when message is empty (WCAG 2.1.1)", () => {
    render(<SendMessageForm productId="p1" recipientId="u1" />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("success message uses role=status for polite announcement (WCAG 4.1.3)", async () => {
    const user = userEvent.setup();
    render(<SendMessageForm productId="p1" recipientId="u1" />);
    await user.type(screen.getByLabelText(/message to seller/i), "Interested!");
    await user.click(screen.getByRole("button", { name: /send message/i }));
    const status = await screen.findByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });
});
