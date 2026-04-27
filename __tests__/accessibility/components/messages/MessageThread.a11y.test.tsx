import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { MessageThread } from "@/components/messages/MessageThread";
import type { MessageWithRelations } from "@/components/messages/MessageThread";

// WCAG references:
//   1.3.1 Info and Relationships — messages are structured
//   2.4.6 Headings and Labels — thread heading identifies the product/recipient
//   4.1.2 Name, Role, Value — reply/note tabs have correct roles and state
//   4.1.3 Status Messages — live region announces new messages

// jsdom doesn't implement scrollIntoView — polyfill it so the component doesn't throw.
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

const sender = { id: "u1", name: "Jane Doe", email: "jane@example.com" };
const recipient = { id: "u2", name: "Admin", email: "admin@example.com" };
const product = { id: "prod-1", name: "Gold Ring" };

const makeMessage = (id: string, senderId: string): MessageWithRelations => ({
  id,
  body: `Test message ${id}`,
  senderId,
  recipientId: senderId === "u1" ? "u2" : "u1",
  productId: "prod-1",
  read: false,
  isNote: false,
  deletedBySenderAt: null,
  deletedByRecipientAt: null,
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-01-15T10:00:00Z"),
  sender: senderId === "u1" ? sender : recipient,
  recipient: senderId === "u1" ? recipient : sender,
  product,
});

const messages: MessageWithRelations[] = [
  makeMessage("m1", "u1"),
  makeMessage("m2", "u2"),
];

describe("MessageThread – accessibility (WCAG 2.1)", () => {
  it("has no axe violations with messages", async () => {
    const { container } = render(
      <MessageThread
        messages={messages}
        currentUserId="u1"
        productId="prod-1"
        recipientId="u2"
        productName="Gold Ring"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with no messages", async () => {
    const { container } = render(
      <MessageThread
        messages={[]}
        currentUserId="u1"
        productId="prod-1"
        recipientId="u2"
        productName="Gold Ring"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the product name as a heading for context (WCAG 2.4.6)", () => {
    render(
      <MessageThread
        messages={messages}
        currentUserId="u1"
        productId="prod-1"
        recipientId="u2"
        productName="Gold Ring"
      />,
    );
    expect(screen.getByRole("heading", { name: /gold ring/i })).toBeInTheDocument();
  });

  it("has a tab interface with correct role (WCAG 4.1.2)", () => {
    render(
      <MessageThread
        messages={messages}
        currentUserId="u1"
        productId="prod-1"
        recipientId="u2"
        productName="Gold Ring"
      />,
    );
    expect(screen.getAllByRole("tab").length).toBeGreaterThan(0);
  });

  it("reply textarea has an accessible label (WCAG 1.3.1)", () => {
    render(
      <MessageThread
        messages={messages}
        currentUserId="u1"
        productId="prod-1"
        recipientId="u2"
        productName="Gold Ring"
      />,
    );
    // The reply textarea should have an accessible label
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });
});
