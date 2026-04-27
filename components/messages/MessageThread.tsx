"use client";

import { useState, useRef, useEffect, useId, forwardRef, useImperativeHandle } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MuiButton from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import type { Message, User, Product } from "@/app/generated/prisma";

export type MessageWithRelations = Message & {
  sender: Pick<User, "id" | "name" | "email">;
  recipient: Pick<User, "id" | "name" | "email">;
  product: Pick<Product, "id" | "name">;
  deletedBySenderAt: Date | null;
  deletedByRecipientAt: Date | null;
};

export interface MessageThreadHandle {
  focusThread: () => void;
}

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
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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

export const MessageThread = forwardRef<MessageThreadHandle, MessageThreadProps>(
  function MessageThread({ messages: initialMessages, currentUserId, productId, recipientId, productName, onClose, onMessageSent }, ref) {
    const [messages, setMessages] = useState(initialMessages);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>("reply");
    const [liveAnnouncement, setLiveAnnouncement] = useState("");
    const headingRef = useRef<HTMLHeadingElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const tabPanelId = useId();

    useImperativeHandle(ref, () => ({ focusThread() { headingRef.current?.focus(); } }));

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const recipientMsg = messages.find((m) => m.senderId !== currentUserId || m.recipientId === currentUserId);
    const recipient = recipientMsg ? (recipientMsg.senderId !== currentUserId ? recipientMsg.sender : recipientMsg.recipient) : null;
    const recipientName = recipient ? (recipient.name ?? recipient.email) : "Customer";

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
        setLiveAnnouncement(`Message sent: ${newMsg.body}`);
        if (andClose) onClose?.();
      }
    }

    const tabs: { id: TabId; label: string }[] = [
      { id: "reply", label: "Reply" },
      { id: "note", label: "Note" },
    ];

    const threadSummary = messages.length === 0
      ? `Conversation with ${recipientName} about ${productName}. No messages yet.`
      : `Conversation with ${recipientName} about ${productName}. ${messages.length} message${messages.length !== 1 ? "s" : ""}.`;

    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* SR heading */}
        <Box component="h2" ref={headingRef} tabIndex={-1} sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
          {threadSummary}
        </Box>
        <Box role="status" aria-live="polite" aria-atomic="true" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
          {liveAnnouncement}
        </Box>

        {/* Header */}
        <Box aria-hidden="true" sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>{recipientName}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.5 }}>Re: {productName}</Typography>
          </Box>
          {onClose && (
            <MuiButton variant="text" size="small" onClick={onClose}
              sx={{ color: "text.secondary", opacity: 0.5, textTransform: "none", letterSpacing: "normal", fontSize: "0.75rem", p: 0, minWidth: 0, "&:hover": { opacity: 1 } }}>
              Close
            </MuiButton>
          )}
        </Box>

        {/* Message list */}
        <Box
          component="ol"
          aria-label={`Messages in conversation with ${recipientName}`}
          sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2, listStyle: "none", m: 0 }}
        >
          {messages.length === 0 && (
            <Box component="li">
              <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4, display: "block", textAlign: "center", py: 4 }}>
                No messages yet
              </Typography>
            </Box>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const senderName = msg.sender.name ?? msg.sender.email;
            const initials = getInitials(msg.sender.name, msg.sender.email);
            const timestamp = relativeTime(msg.createdAt);
            const fullTime = new Date(msg.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
            return (
              <Box
                component="li"
                key={msg.id}
                tabIndex={0}
                aria-label={`${isMe ? "You" : senderName}, ${fullTime}: ${msg.body}`}
                sx={{ display: "flex", gap: 1.25, flexDirection: isMe ? "row-reverse" : "row", borderRadius: 1, "&:focus": { outline: "none" }, "&:focus-visible": { ring: 1 } }}
              >
                {!isMe && (
                  <Box aria-hidden="true" sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "rgba(122,92,16,0.15)", border: "1px solid rgba(122,92,16,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.5 }}>
                    <Typography sx={{ fontSize: "0.625rem", fontWeight: 600, color: "primary.main" }}>{initials}</Typography>
                  </Box>
                )}
                <Box aria-hidden="true" sx={{ display: "flex", flexDirection: "column", gap: 0.5, maxWidth: "75%", alignItems: isMe ? "flex-end" : "flex-start" }}>
                  <Box sx={{
                    px: 2, py: 1.25, borderRadius: 1, fontSize: "0.875rem", lineHeight: 1.6,
                    ...(isMe ? { bgcolor: "rgba(122,92,16,0.1)", border: "1px solid rgba(122,92,16,0.15)", color: "text.primary" }
                      : { bgcolor: "background.paper", border: "1px solid", borderColor: "divider", color: "text.primary" }),
                  }}>
                    {msg.body}
                  </Box>
                  <Typography component="time" dateTime={new Date(msg.createdAt).toISOString()} sx={{ fontSize: "0.625rem", color: "text.secondary", opacity: 0.3, px: 0.5 }}>
                    {timestamp}
                  </Typography>
                </Box>
              </Box>
            );
          })}
          <Box ref={bottomRef} aria-hidden="true" />
        </Box>

        {/* Reply box */}
        <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          {/* Tabs */}
          <Box role="tablist" aria-label="Compose options" sx={{ display: "flex", borderBottom: "1px solid", borderColor: "divider" }}>
            {tabs.map((tab) => (
              <Box
                component="button"
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`${tabPanelId}-panel`}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  px: 2, py: 1.25, fontSize: "0.75rem", fontWeight: 500, cursor: "pointer",
                  border: "none", background: "none", borderBottom: "2px solid",
                  mb: "-1px",
                  borderBottomColor: activeTab === tab.id ? "primary.main" : "transparent",
                  color: activeTab === tab.id ? "primary.main" : "rgba(122,116,112,0.5)",
                  transition: "all 0.15s",
                  "&:hover": { color: activeTab === tab.id ? "primary.main" : "text.secondary" },
                }}
              >
                {tab.label}
              </Box>
            ))}
          </Box>

          {/* Tab panel */}
          <Box
            id={`${tabPanelId}-panel`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
          >
          <Box
            component="form"
            onSubmit={(e) => { e.preventDefault(); sendMessage(false); }}
            sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <TextField
              multiline
              rows={3}
              placeholder={activeTab === "note" ? "Add an internal note..." : "Type a reply..."}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              fullWidth
              size="small"
              aria-label={activeTab === "note" ? "Internal note" : "Reply message"}
              sx={{ "& .MuiOutlinedInput-input": { resize: "none" } }}
            />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <IconButton
                aria-label="Attach image"
                size="small"
                sx={{ color: "text.secondary", opacity: 0.4, "&:hover": { opacity: 1, bgcolor: "#ede9e3" } }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </IconButton>
              <Box sx={{ display: "flex", gap: 1 }}>
                {onClose && (
                  <MuiButton variant="outlined" size="small" disabled={!body.trim() || loading} onClick={() => sendMessage(true)}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem", borderColor: "#1a1714", color: "#1a1714", "&:hover": { bgcolor: "#7a5c10", borderColor: "#7a5c10" }, "&.Mui-disabled": { opacity: 0.5 } }}>
                    Send and close
                  </MuiButton>
                )}
                <MuiButton type="submit" variant="contained" size="small" disabled={!body.trim() || loading}
                  startIcon={loading ? <CircularProgress size={12} sx={{ color: "inherit" }} /> : undefined}
                  sx={{ bgcolor: "#1a1714", color: "#fdfbf8", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem", "&:hover": { bgcolor: "#7a5c10" }, "&.Mui-disabled": { opacity: 0.5 } }}>
                  Send
                </MuiButton>
              </Box>
            </Box>
          </Box>
          </Box>
        </Box>
      </Box>
    );
  }
);
