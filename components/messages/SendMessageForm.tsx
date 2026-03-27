"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface SendMessageFormProps {
  productId: string;
  recipientId: string;
}

export function SendMessageForm({ productId, recipientId }: SendMessageFormProps) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, recipientId, body }),
    });

    setLoading(false);
    if (res.ok) {
      setSent(true);
      setBody("");
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to send message.");
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-sm text-emerald-400"
      >
        Message sent! The seller will get back to you soon.
        <button
          className="ml-2 text-xs underline opacity-70 hover:opacity-100"
          onClick={() => setSent(false)}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && (
        <p role="alert" aria-live="assertive" className="text-xs text-red-400">{error}</p>
      )}
      <Textarea
        label="Message to seller"
        placeholder="I'm interested in this item. Is it still available?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
      />
      <Button type="submit" loading={loading} size="sm" disabled={!body.trim()}>
        Send Message
      </Button>
    </form>
  );
}
