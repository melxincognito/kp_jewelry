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
}

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

interface MessagesLayoutProps {
  initialThreads: ThreadData[];
  currentUserId: string;
}

export function MessagesLayout({ initialThreads, currentUserId }: MessagesLayoutProps) {
  const [threads, setThreads] = useState(() => sortByLatest(initialThreads));
  const [selectedKey, setSelectedKey] = useState<string | null>(
    () => sortByLatest(initialThreads)[0]?.key ?? null
  );
  const [showThread, setShowThread] = useState(false);

  const threadRef = useRef<MessageThreadHandle>(null);

  const selectedThread = threads.find((t) => t.key === selectedKey) ?? null;

  // Move focus into the thread panel whenever the selection changes
  useEffect(() => {
    if (selectedKey) {
      // Small timeout lets React finish rendering the new thread before focusing
      const id = setTimeout(() => threadRef.current?.focusThread(), 50);
      return () => clearTimeout(id);
    }
  }, [selectedKey]);

  const handleMessageSent = useCallback((threadKey: string, msg: MessageWithRelations) => {
    setThreads((prev) =>
      sortByLatest(
        prev.map((t) =>
          t.key === threadKey ? { ...t, messages: [...t.messages, msg] } : t
        )
      )
    );
  }, []);

  function selectThread(key: string) {
    setSelectedKey(key);
    setShowThread(true);
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm overflow-hidden">

      {/* ── Left panel: conversation list ── */}
      <nav
        aria-label="Conversations"
        className={`w-72 shrink-0 border-r border-[var(--black-border)] flex flex-col overflow-hidden ${
          showThread ? "hidden sm:flex" : "flex"
        }`}
      >
        <div className="px-4 py-3 border-b border-[var(--black-border)]">
          <p className="text-[10px] font-medium tracking-widest text-[var(--white-dim)]/40 uppercase">
            Conversations
          </p>
        </div>

        <ul role="list" className="flex-1 overflow-y-auto">
          {threads.length === 0 && (
            <li className="px-4 py-10 text-xs text-[var(--white-dim)]/30 text-center">
              No conversations yet
            </li>
          )}

          {threads.map((thread) => {
            const lastMsg = thread.messages.at(-1);
            const isSelected = thread.key === selectedKey;
            const lastTime = lastMsg ? relativeTime(lastMsg.createdAt) : "";
            const preview = lastMsg?.body ?? "";

            // Always derive name from the other person in the messages
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

            return (
              <li key={thread.key} className="border-b border-[var(--black-border)]">
                <button
                  type="button"
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`${displayName}, ${thread.productName}${preview ? `, last message: ${preview.slice(0, 60)}` : ""}. Press Enter to open.`}
                  onClick={() => selectThread(thread.key)}
                  className={[
                    "w-full px-4 py-3.5 flex items-start gap-3 text-left transition-colors border-l-2",
                    isSelected
                      ? "bg-[var(--gold)]/10 border-[var(--gold)]"
                      : "border-transparent hover:bg-[var(--black-soft)]",
                  ].join(" ")}
                >
                  {/* Avatar */}
                  <div
                    aria-hidden="true"
                    className={[
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold",
                      isSelected
                        ? "bg-[var(--gold)]/25 text-[var(--gold)] border border-[var(--gold)]/40"
                        : "bg-[var(--gold)]/10 text-[var(--gold)]/60 border border-[var(--gold)]/20",
                    ].join(" ")}
                  >
                    {initials}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
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
                    {preview && (
                      <p className="text-xs text-[var(--white-dim)]/35 truncate mt-0.5 leading-snug">
                        {preview}
                      </p>
                    )}
                  </div>
                </button>
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
        {/* Mobile back button */}
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
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-[var(--white-dim)]/30">Select a conversation</p>
          </div>
        )}
      </section>
    </div>
  );
}
