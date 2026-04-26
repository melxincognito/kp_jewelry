"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { MessageThread, type MessageWithRelations, type MessageThreadHandle } from "./MessageThread";

export interface ThreadData {
  key: string;
  messages: MessageWithRelations[];
  recipientId: string;
  productId: string;
  productName: string;
  recipientName: string;
  deletedAt?: Date | null;
}

type View = "inbox" | "deleted";

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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

interface MessagesLayoutProps {
  initialInboxThreads: ThreadData[];
  initialDeletedThreads: ThreadData[];
  currentUserId: string;
}

export function MessagesLayout({ initialInboxThreads, initialDeletedThreads, currentUserId }: MessagesLayoutProps) {
  const [view, setView] = useState<View>("inbox");
  const [inboxThreads, setInboxThreads] = useState(() => sortByLatest(initialInboxThreads));
  const [deletedThreads, setDeletedThreads] = useState(() => sortByLatest(initialDeletedThreads));
  const [selectedKey, setSelectedKey] = useState<string | null>(() => sortByLatest(initialInboxThreads)[0]?.key ?? null);
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
    setSelectedKey(next === "inbox" ? inboxThreads[0]?.key ?? null : deletedThreads[0]?.key ?? null);
    setShowThread(false);
  }

  const handleMessageSent = useCallback((threadKey: string, msg: MessageWithRelations) => {
    setInboxThreads((prev) =>
      sortByLatest(prev.map((t) => t.key === threadKey ? { ...t, messages: [...t.messages, msg] } : t))
    );
  }, []);

  const handleDelete = useCallback(async (thread: ThreadData) => {
    setLoadingKey(thread.key);
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
  }, [selectedKey]);

  const handleRestore = useCallback(async (thread: ThreadData) => {
    setLoadingKey(thread.key);
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

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 10rem)", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 0.5, overflow: "hidden" }}>

      {/* Left panel */}
      <Box
        component="nav"
        aria-label="Conversations"
        sx={{
          width: 288,
          flexShrink: 0,
          borderRight: "1px solid",
          borderColor: "divider",
          display: { xs: showThread ? "none" : "flex", sm: "flex" },
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Tab switcher */}
        <Box role="tablist" aria-label="Message views" sx={{ display: "flex", borderBottom: "1px solid", borderColor: "divider" }}>
          {(["inbox", "deleted"] as View[]).map((v) => (
            <Box
              key={v}
              component="button"
              role="tab"
              aria-selected={view === v}
              aria-controls={`panel-${v}`}
              onClick={() => switchView(v)}
              sx={{
                flex: 1,
                py: 1.25,
                fontSize: "0.625rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                border: "none",
                background: "none",
                borderBottom: "2px solid",
                mb: "-1px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                borderBottomColor: view === v ? "primary.main" : "transparent",
                color: view === v ? "primary.main" : "rgba(122,116,112,0.4)",
                transition: "all 0.15s",
                "&:hover": { color: view === v ? "primary.main" : "text.secondary" },
              }}
            >
              {v === "inbox" ? "Inbox" : "Deleted"}
              {v === "inbox" && inboxThreads.length > 0 && (
                <Box component="span" sx={{ fontSize: "0.5625rem", bgcolor: "rgba(122,92,16,0.12)", color: "primary.main", borderRadius: "999px", px: 0.75, py: 0.25 }}>
                  {inboxThreads.length}
                </Box>
              )}
              {v === "deleted" && deletedThreads.length > 0 && (
                <Box component="span" sx={{ fontSize: "0.5625rem", bgcolor: "rgba(185,28,28,0.12)", color: "#b91c1c", borderRadius: "999px", px: 0.75, py: 0.25 }}>
                  {deletedThreads.length}
                </Box>
              )}
            </Box>
          ))}
        </Box>

        {/* Thread list */}
        <Box
          component="ul"
          id={`panel-${view}`}
          role="list"
          aria-label={view === "inbox" ? "Inbox conversations" : "Deleted conversations"}
          sx={{ flex: 1, overflowY: "auto", listStyle: "none", m: 0, p: 0 }}
        >
          {activeThreads.length === 0 && (
            <Box component="li" sx={{ px: 2, py: 5, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.3 }}>
                {view === "inbox" ? "No conversations yet" : "Deleted messages will appear here"}
              </Typography>
            </Box>
          )}

          {activeThreads.map((thread) => {
            const lastMsg = thread.messages.at(-1);
            const isSelected = thread.key === selectedKey;
            const isLoading = loadingKey === thread.key;
            const lastTime = lastMsg ? relativeTime(lastMsg.createdAt) : "";
            const preview = lastMsg?.body ?? "";

            const anyMsg = thread.messages.find((m) => m.senderId !== currentUserId || m.recipientId !== currentUserId);
            const otherPerson = anyMsg ? (anyMsg.senderId !== currentUserId ? anyMsg.sender : anyMsg.recipient) : null;
            const displayName = otherPerson?.name ?? otherPerson?.email ?? thread.recipientName;
            const initials = getInitials(displayName);

            const deleted = daysAgo(thread.deletedAt);
            const daysLeft = 30 - deleted;

            return (
              <Box
                component="li"
                key={thread.key}
                sx={{ borderBottom: "1px solid", borderColor: "divider", position: "relative", "&:hover .thread-action": { opacity: 1 } }}
              >
                <Box
                  component="button"
                  type="button"
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`${displayName}, ${thread.productName}${preview ? `, last message: ${preview.slice(0, 60)}` : ""}. Press Enter to open.`}
                  onClick={() => selectThread(thread.key)}
                  disabled={isLoading}
                  sx={{
                    width: "100%",
                    px: 2,
                    py: 1.75,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    textAlign: "left",
                    border: "none",
                    borderLeft: "2px solid",
                    background: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    borderLeftColor: isSelected ? "primary.main" : "transparent",
                    bgcolor: isSelected ? "rgba(122,92,16,0.06)" : "transparent",
                    opacity: isLoading ? 0.5 : 1,
                    "&:hover": { bgcolor: isSelected ? "rgba(122,92,16,0.06)" : "#ede9e3" },
                  }}
                >
                  {/* Avatar */}
                  <Box
                    aria-hidden="true"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.25,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      ...(isSelected
                        ? { bgcolor: "rgba(122,92,16,0.2)", color: "primary.main", border: "1px solid rgba(122,92,16,0.35)" }
                        : view === "deleted"
                        ? { bgcolor: "rgba(185,28,28,0.08)", color: "rgba(185,28,28,0.55)", border: "1px solid rgba(185,28,28,0.18)" }
                        : { bgcolor: "rgba(122,92,16,0.08)", color: "rgba(122,92,16,0.55)", border: "1px solid rgba(122,92,16,0.18)" }),
                    }}
                  >
                    {initials}
                  </Box>

                  {/* Text */}
                  <Box sx={{ flex: 1, minWidth: 0, pr: 3.5 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ fontWeight: isSelected ? 500 : 400, color: isSelected ? "text.primary" : "text.secondary" }}
                      >
                        {displayName}
                      </Typography>
                      {lastTime && (
                        <Typography
                          component="time"
                          dateTime={lastMsg ? new Date(lastMsg.createdAt).toISOString() : ""}
                          sx={{ fontSize: "0.625rem", color: "text.secondary", opacity: 0.3, flexShrink: 0 }}
                        >
                          {lastTime}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" noWrap sx={{ display: "block", color: "primary.main", opacity: 0.5, mt: 0.25 }}>
                      {thread.productName}
                    </Typography>
                    {view === "deleted" && thread.deletedAt ? (
                      <Typography variant="caption" sx={{ display: "block", color: "#b91c1c", opacity: 0.6, mt: 0.25 }}>
                        {daysLeft > 0
                          ? `Deleted ${deleted}d ago · ${daysLeft}d until permanent deletion`
                          : "Pending permanent deletion"}
                      </Typography>
                    ) : preview ? (
                      <Typography variant="caption" noWrap sx={{ display: "block", color: "text.secondary", opacity: 0.35, mt: 0.25, lineHeight: 1.4 }}>
                        {preview}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>

                {/* Action button — shown on hover */}
                <Box
                  className="thread-action"
                  sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", opacity: 0, transition: "opacity 0.15s", "&:focus-within": { opacity: 1 } }}
                >
                  {view === "inbox" ? (
                    <IconButton
                      size="small"
                      aria-label={`Delete conversation with ${displayName}`}
                      disabled={isLoading}
                      onClick={(e) => { e.stopPropagation(); handleDelete(thread); }}
                      sx={{ color: "text.secondary", opacity: 0.3, "&:hover": { color: "#b91c1c", opacity: 1, bgcolor: "rgba(185,28,28,0.08)" } }}
                    >
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      aria-label={`Restore conversation with ${displayName}`}
                      disabled={isLoading}
                      onClick={(e) => { e.stopPropagation(); handleRestore(thread); }}
                      sx={{ color: "text.secondary", opacity: 0.3, "&:hover": { color: "#059669", opacity: 1, bgcolor: "rgba(5,150,105,0.08)" } }}
                    >
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </IconButton>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Right panel */}
      <Box
        component="section"
        aria-label={selectedThread ? `Conversation with ${selectedThread.recipientName}` : "No conversation selected"}
        sx={{ flex: 1, minWidth: 0, display: { xs: showThread ? "flex" : "none", sm: "flex" }, flexDirection: "column" }}
      >
        {/* Mobile back button */}
        <Box sx={{ display: { xs: "block", sm: "none" }, px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box
            component="button"
            type="button"
            onClick={() => setShowThread(false)}
            aria-label="Back to conversations list"
            sx={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "primary.main", p: 0 }}
          >
            ← Conversations
          </Box>
        </Box>

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
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.3 }}>
              {view === "deleted" ? "Select a deleted conversation to view it" : "Select a conversation"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
