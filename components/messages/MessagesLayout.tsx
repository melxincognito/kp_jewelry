"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MessageThread, type MessageWithRelations, type MessageThreadHandle } from "./MessageThread";

export interface ThreadData {
  key: string;
  messages: MessageWithRelations[];
  recipientId: string;
  productId: string;
  productName: string;
  recipientName: string;
  /** When the current user soft-deleted this thread (undefined = inbox) */
  deletedAt?: Date | null;
}

type View = "inbox" | "deleted";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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

function sortByLatest(threads: ThreadData[]): ThreadData[] {
  return [...threads].sort((a, b) => {
    const aLast = a.messages.at(-1)?.createdAt ?? 0;
    const bLast = b.messages.at(-1)?.createdAt ?? 0;
    return new Date(bLast).getTime() - new Date(aLast).getTime();
  });
}

function daysAgo(date: Date | null | undefined): number {
  if (!date) return 0;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

// ── Component ─────────────────────────────────────────────────────────────────

interface MessagesLayoutProps {
  initialInboxThreads: ThreadData[];
  initialDeletedThreads: ThreadData[];
  currentUserId: string;
}

export function MessagesLayout({
  initialInboxThreads,
  initialDeletedThreads,
  currentUserId,
}: MessagesLayoutProps) {
  const [view, setView] = useState<View>("inbox");
  const [inboxThreads, setInboxThreads] = useState(() => sortByLatest(initialInboxThreads));
  const [deletedThreads, setDeletedThreads] = useState(() => sortByLatest(initialDeletedThreads));
  const [selectedKey, setSelectedKey] = useState<string | null>(
    () => sortByLatest(initialInboxThreads)[0]?.key ?? null
  );
  const [showThread, setShowThread] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const threadRef = useRef<MessageThreadHandle>(null);

  const activeThreads = view === "inbox" ? inboxThreads : deletedThreads;
  const selectedThread = activeThreads.find((t) => t.key === selectedKey) ?? null;

  useEffect(() => {
    if (selectedKey) {
      const id = setTimeout(() => threadRef.current?.focusThread(), 50);
      return () => clearTimeout(id);
    }
  }, [selectedKey]);

  function selectThread(key: string) {
    setSelectedKey(key);
    setShowThread(true);
  }

  function switchView(next: View) {
    setView(next);
    setSelectedKey(
      next === "inbox"
        ? inboxThreads[0]?.key ?? null
        : deletedThreads[0]?.key ?? null
    );
    setShowThread(false);
  }

  const handleMessageSent = useCallback((threadKey: string, msg: MessageWithRelations) => {
    setInboxThreads((prev) =>
      sortByLatest(
        prev.map((t) =>
          t.key === threadKey ? { ...t, messages: [...t.messages, msg] } : t
        )
      )
    );
  }, []);

  const handleDelete = useCallback(
    async (thread: ThreadData) => {
      setLoadingKey(thread.key);

      // Optimistically move to deleted
      const now = new Date();
      setInboxThreads((prev) => prev.filter((t) => t.key !== thread.key));
      setDeletedThreads((prev) => sortByLatest([{ ...thread, deletedAt: now }, ...prev]));
      if (selectedKey === thread.key) setSelectedKey(null);

      await fetch("/api/messages/threads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: thread.productId, otherId: thread.recipientId }),
      });
      setLoadingKey(null);
    },
    [selectedKey]
  );

  const handleRestore = useCallback(async (thread: ThreadData) => {
    setLoadingKey(thread.key);

    // Optimistically move back to inbox
    setDeletedThreads((prev) => prev.filter((t) => t.key !== thread.key));
    setInboxThreads((prev) => sortByLatest([{ ...thread, deletedAt: null }, ...prev]));
    if (selectedKey === thread.key) setSelectedKey(null);

    await fetch("/api/messages/threads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: thread.productId, otherId: thread.recipientId }),
    });
    setLoadingKey(null);
  }, [selectedKey]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm overflow-hidden">

      {/* ── Left panel ── */}
      <nav
        aria-label="Conversations"
        className={`w-72 shrink-0 border-r border-[var(--black-border)] flex flex-col overflow-hidden ${
          showThread ? "hidden sm:flex" : "flex"
        }`}
      >
        {/* Tab switcher */}
        <div
          role="tablist"
          aria-label="Message views"
          className="flex border-b border-[var(--black-border)]"
        >
          {(["inbox", "deleted"] as View[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              aria-controls={`panel-${v}`}
              onClick={() => switchView(v)}
              className={[
                "flex-1 py-2.5 text-[10px] font-medium tracking-widest uppercase transition-colors",
                view === v
                  ? "text-[var(--gold)] border-b-2 border-[var(--gold)]"
                  : "text-[var(--white-dim)]/40 hover:text-[var(--white-dim)]",
              ].join(" ")}
            >
              {v === "inbox" ? (
                <>
                  Inbox
                  {inboxThreads.length > 0 && (
                    <span className="ml-1.5 text-[9px] bg-[var(--gold)]/15 text-[var(--gold)] rounded-full px-1.5 py-0.5">
                      {inboxThreads.length}
                    </span>
                  )}
                </>
              ) : (
                <>
                  Deleted
                  {deletedThreads.length > 0 && (
                    <span className="ml-1.5 text-[9px] bg-red-500/15 text-red-400 rounded-full px-1.5 py-0.5">
                      {deletedThreads.length}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Thread list */}
        <ul
          id={`panel-${view}`}
          role="list"
          aria-label={view === "inbox" ? "Inbox conversations" : "Deleted conversations"}
          className="flex-1 overflow-y-auto"
        >
          {activeThreads.length === 0 && (
            <li className="px-4 py-10 text-xs text-[var(--white-dim)]/30 text-center">
              {view === "inbox" ? "No conversations yet" : "Deleted messages will appear here"}
            </li>
          )}

          {activeThreads.map((thread) => {
            const lastMsg = thread.messages.at(-1);
            const isSelected = thread.key === selectedKey;
            const isLoading = loadingKey === thread.key;
            const lastTime = lastMsg ? relativeTime(lastMsg.createdAt) : "";
            const preview = lastMsg?.body ?? "";

            const anyMsg = thread.messages.find(
              (m) => m.senderId !== currentUserId || m.recipientId !== currentUserId
            );
            const otherPerson = anyMsg
              ? anyMsg.senderId !== currentUserId
                ? anyMsg.sender
                : anyMsg.recipient
              : null;
            const displayName =
              otherPerson?.name ?? otherPerson?.email ?? thread.recipientName;
            const initials = getInitials(displayName);

            const deleted = daysAgo(thread.deletedAt);
            const daysLeft = 30 - deleted;

            return (
              <li key={thread.key} className="border-b border-[var(--black-border)] group relative">
                <button
                  type="button"
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`${displayName}, ${thread.productName}${preview ? `, last message: ${preview.slice(0, 60)}` : ""}. Press Enter to open.`}
                  onClick={() => selectThread(thread.key)}
                  disabled={isLoading}
                  className={[
                    "w-full px-4 py-3.5 flex items-start gap-3 text-left transition-colors border-l-2",
                    isSelected
                      ? "bg-[var(--gold)]/10 border-[var(--gold)]"
                      : "border-transparent hover:bg-[var(--black-soft)]",
                    isLoading ? "opacity-50" : "",
                  ].join(" ")}
                >
                  {/* Avatar */}
                  <div
                    aria-hidden="true"
                    className={[
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold",
                      isSelected
                        ? "bg-[var(--gold)]/25 text-[var(--gold)] border border-[var(--gold)]/40"
                        : view === "deleted"
                        ? "bg-red-500/10 text-red-400/60 border border-red-500/20"
                        : "bg-[var(--gold)]/10 text-[var(--gold)]/60 border border-[var(--gold)]/20",
                    ].join(" ")}
                  >
                    {initials}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 pr-7">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={`text-sm truncate ${
                          isSelected ? "text-[var(--white)] font-medium" : "text-[var(--white-dim)]"
                        }`}
                      >
                        {displayName}
                      </p>
                      {lastTime && (
                        <time
                          dateTime={lastMsg ? new Date(lastMsg.createdAt).toISOString() : ""}
                          className="text-[10px] text-[var(--white-dim)]/30 shrink-0"
                        >
                          {lastTime}
                        </time>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--gold)]/50 truncate mt-0.5">
                      {thread.productName}
                    </p>
                    {view === "deleted" && thread.deletedAt ? (
                      <p className="text-[10px] text-red-400/60 mt-0.5">
                        {daysLeft > 0
                          ? `Deleted ${deleted}d ago · ${daysLeft}d until permanent deletion`
                          : "Pending permanent deletion"}
                      </p>
                    ) : preview ? (
                      <p className="text-xs text-[var(--white-dim)]/35 truncate mt-0.5 leading-snug">
                        {preview}
                      </p>
                    ) : null}
                  </div>
                </button>

                {/* Action button — shown on hover / focus-within */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  {view === "inbox" ? (
                    <button
                      type="button"
                      aria-label={`Delete conversation with ${displayName}`}
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(thread);
                      }}
                      className="p-1.5 rounded text-[var(--white-dim)]/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Restore conversation with ${displayName}`}
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(thread);
                      }}
                      className="p-1.5 rounded text-[var(--white-dim)]/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Right panel: message thread ── */}
      <section
        aria-label={
          selectedThread
            ? `Conversation with ${selectedThread.recipientName}`
            : "No conversation selected"
        }
        className={`flex-1 min-w-0 flex flex-col ${showThread ? "flex" : "hidden sm:flex"}`}
      >
        {/* Mobile back */}
        <div className="sm:hidden px-4 py-2 border-b border-[var(--black-border)]">
          <button
            type="button"
            onClick={() => setShowThread(false)}
            aria-label="Back to conversations list"
            className="text-xs text-[var(--gold)]"
          >
            ← Conversations
          </button>
        </div>

        {selectedThread ? (
          <MessageThread
            ref={threadRef}
            key={selectedThread.key}
            messages={selectedThread.messages}
            currentUserId={currentUserId}
            productId={selectedThread.productId}
            recipientId={selectedThread.recipientId}
            productName={selectedThread.productName}
            onMessageSent={(msg) => handleMessageSent(selectedThread.key, msg)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-[var(--white-dim)]/30">
              {view === "deleted"
                ? "Select a deleted conversation to view it"
                : "Select a conversation"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
