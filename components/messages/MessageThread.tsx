"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { Message, User, Product } from "@/app/generated/prisma";

type MessageWithRelations = Message & {
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
}

export function MessageThread({
  messages: initialMessages,
  currentUserId,
  productId,
  recipientId,
  productName,
}: MessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
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
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--black-border)]">
        <p className="text-xs text-[var(--gold)]">Re: {productName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-xs text-[var(--white-dim)]/40 text-center py-8">
            No messages yet
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
            >
              <div
                className={[
                  "px-4 py-2.5 rounded-sm text-sm",
                  isMe
                    ? "bg-[var(--gold)]/15 text-[var(--white)] border border-[var(--gold)]/20"
                    : "bg-[var(--black-card)] text-[var(--white)] border border-[var(--black-border)]",
                ].join(" ")}
              >
                {msg.body}
              </div>
              <p className="text-[10px] text-[var(--white-dim)]/30">
                {isMe ? "You" : (msg.sender.name ?? msg.sender.email)} ·{" "}
                {new Date(msg.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Reply */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-[var(--black-border)] flex gap-3 items-end"
      >
        <Textarea
          placeholder="Type a reply..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          className="flex-1"
        />
        <Button type="submit" loading={loading} disabled={!body.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
