"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { Message, User, Product } from "@/app/generated/prisma";

export type MessageWithRelations = Message & {
  sender: Pick<User, "id" | "name" | "email">;
  recipient: Pick<User, "id" | "name" | "email">;
  product: Pick<Product, "id" | "name">;
};

interface MessageThreadProps {
  messages: MessageWithRelations[];
  currentUserId: string;
  productId: string;
  recipientId: string;
  productName: string;
  onClose?: () => void;
  onMessageSent?: (msg: MessageWithRelations) => void;
}

type TabId = "reply" | "note";

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

function relativeTime(date: Date | string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MessageThread({
  messages: initialMessages,
  currentUserId,
  productId,
  recipientId,
  productName,
  onClose,
  onMessageSent,
}: MessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("reply");
  const bottomRef = useRef<HTMLDivElement>(null);
  const tabPanelId = useId();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Derive recipient display name from messages
  const recipientMsg = messages.find(
    (m) => m.senderId !== currentUserId || m.recipientId === currentUserId
  );
  const recipient = recipientMsg
    ? recipientMsg.senderId !== currentUserId
      ? recipientMsg.sender
      : recipientMsg.recipient
    : null;
  const recipientName = recipient
    ? (recipient.name ?? recipient.email)
    : "Customer";

  async function sendMessage(andClose = false) {
    if (!body.trim()) return;
    setLoading(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, recipientId, body }),
    });

    setLoading(false);
    if (res.ok) {
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setBody("");
      onMessageSent?.(newMsg);
      if (andClose) onClose?.();
    }
  }


  const tabs: { id: TabId; label: string }[] = [
    { id: "reply", label: "Reply" },
    { id: "note", label: "Note" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--black-border)] flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--white)]">{recipientName}</p>
          <p className="text-xs text-[var(--white-dim)]/50 mt-0.5">Re: {productName}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close conversation"
            className="text-xs text-[var(--white-dim)]/50 hover:text-[var(--white)] transition-colors shrink-0 mt-0.5"
          >
            Close
          </button>
        )}
      </div>

      {/* Message list */}
      <div
        role="log"
        aria-label="Conversation messages"
        aria-live="polite"
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
      >
        {messages.length === 0 && (
          <p className="text-xs text-[var(--white-dim)]/40 text-center py-8">
            No messages yet
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const senderName = msg.sender.name ?? msg.sender.email;
          const initials = getInitials(msg.sender.name, msg.sender.email);
          const timestamp = relativeTime(msg.createdAt);

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar — only for received messages */}
              {!isMe && (
                <div
                  aria-hidden="true"
                  className="w-8 h-8 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/30 flex items-center justify-center shrink-0 mt-1"
                >
                  <span className="text-[10px] font-semibold text-[var(--gold)]">
                    {initials}
                  </span>
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={[
                    "px-4 py-2.5 rounded-sm text-sm leading-relaxed",
                    isMe
                      ? "bg-[var(--gold)]/15 text-[var(--white)] border border-[var(--gold)]/20"
                      : "bg-[var(--black-card)] text-[var(--white)] border border-[var(--black-border)]",
                  ].join(" ")}
                >
                  {msg.body}
                </div>
                <p className="text-[10px] text-[var(--white-dim)]/30 px-1">
                  <span className="sr-only">{isMe ? "You" : senderName} sent </span>
                  <time dateTime={new Date(msg.createdAt).toISOString()}>
                    {timestamp}
                  </time>
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Reply box */}
      <div className="border-t border-[var(--black-border)]">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Compose options"
          className="flex border-b border-[var(--black-border)]"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`${tabPanelId}-panel`}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-[var(--gold)] text-[var(--gold)]"
                  : "border-transparent text-[var(--white-dim)]/50 hover:text-[var(--white-dim)]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <form
          id={`${tabPanelId}-panel`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          onSubmit={(e) => { e.preventDefault(); sendMessage(false); }}
          className="p-4 flex flex-col gap-3"
        >
          <Textarea
            placeholder={
              activeTab === "note"
                ? "Add an internal note..."
                : "Type a reply..."
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            aria-label={activeTab === "note" ? "Internal note" : "Reply message"}
            className="flex-1 resize-none"
          />

          <div className="flex items-center justify-between gap-2">
            {/* Image attachment (decorative/future use) */}
            <button
              type="button"
              aria-label="Attach image"
              className="p-1.5 rounded-sm text-[var(--white-dim)]/40 hover:text-[var(--white-dim)] hover:bg-[var(--black-soft)] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>

            <div className="flex gap-2">
              {onClose && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!body.trim() || loading}
                  onClick={() => sendMessage(true)}
                >
                  Send and close
                </Button>
              )}
              <Button
                type="submit"
                loading={loading}
                disabled={!body.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
