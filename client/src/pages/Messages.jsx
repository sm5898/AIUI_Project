import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import MessageBubble from "../components/Messagebubble";
import api from "../api/api";
import "../styles/layouts.css";

export default function Messages() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  const fetchConversations = async () => {
    try {
      if (!user?.id) return;

      const response = await api.get(`/messages/${user.id}`);
      setConversations(response.data);

      if (response.data.length > 0 && !activeId) {
        setActiveId(response.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Could not load conversations.");
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const createOrOpenThread = async () => {
      try {
        if (!user?.id) return;

        // Shortcut: navigate directly to an existing conversation
        if (location.state?.conversationId) {
          setActiveId(location.state.conversationId);
          return;
        }

        if (!location.state?.recipientId || !location.state?.listingId) return;

        const response = await api.post("/messages/thread", {
          senderId: user.id,
          recipientId: location.state.recipientId,
          listingId: location.state.listingId,
        });

        const thread = response.data;

        setConversations((prev) => {
          const exists = prev.some((c) => c._id === thread._id);
          if (exists) {
            return prev.map((c) => (c._id === thread._id ? thread : c));
          }
          return [thread, ...prev];
        });

        setActiveId(thread._id);
      } catch (err) {
        console.error("Error creating/opening thread:", err);
        setError("Could not open conversation.");
      }
    };

    createOrOpenThread();
  }, [location.state, user?.id]);

  const formattedConversations = useMemo(() => {
    return conversations.map((conversation) => {
      const otherParticipant =
        conversation.participants?.find((p) => p._id !== user?.id) || null;

      const messages =
        conversation.messages?.map((msg) => ({
          id: msg._id || msg.createdAt,
          sender:
            msg.senderId === user?.id ||
            msg.senderId?._id === user?.id
              ? "me"
              : "them",
          text: msg.text,
          time: msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
            : "",
        })) || [];

      const preview =
        messages.length > 0
          ? messages[messages.length - 1].text
          : `Conversation about ${conversation.listingId?.title || "listing"}`;

      const displayName = otherParticipant
        ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
        : "Unknown user";

      const initials = otherParticipant
        ? `${otherParticipant.firstName?.[0] || ""}${otherParticipant.lastName?.[0] || ""}`.toUpperCase()
        : "?";

      return {
        id: conversation._id,
        name: displayName,
        initials,
        preview,
        listingTitle: conversation.listingId?.title || "",
        messages,
      };
    });
  }, [conversations, user?.id]);

  const active = formattedConversations.find((c) => c.id === activeId);

  const filtered = formattedConversations.filter((c) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const nameMatch = c.name.toLowerCase().includes(q);
    const messageMatch = c.messages.some((m) => m.text.toLowerCase().includes(q));
    const listingMatch = c.listingTitle.toLowerCase().includes(q);
    return nameMatch || messageMatch || listingMatch;
  });

  const sendMessage = async () => {
    try {
      if (!input.trim() || !activeId || !user?.id) return;

      const response = await api.post(`/messages/${activeId}`, {
        senderId: user.id,
        text: input.trim(),
      });

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === activeId ? response.data : conversation
        )
      );

      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Could not send message.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const deleteConversation = async (id) => {
    if (!window.confirm("Delete this conversation? This cannot be undone.")) return;
    try {
      await api.delete(`/messages/${id}`, { data: { userId: user.id } });
      setConversations((prev) => prev.filter((c) => c._id !== id));
      setActiveId((prev) => {
        const remaining = conversations.filter((c) => c._id !== id);
        return remaining.length > 0 ? remaining[0]._id : null;
      });
    } catch (err) {
      console.error("Error deleting conversation:", err);
      setError("Could not delete conversation.");
    }
  };

  return (
    <div className="msg-page">
      <Navbar active="messages" />

      <div className="msg-outer">
        <h1 className="msg-heading">Conversations</h1>

        <div className="msg-layout">
          <div className="msg-sidebar">
            <div className="msg-search-wrap">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
              <input
                className="msg-search-input"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="msg-convo-list">
              {filtered.length === 0 ? (
                <div className="msg-empty">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#C4CADA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="msg-empty-title">
                    {search ? `No results for "${search}"` : "No conversations yet"}
                  </span>
                  {!search && (
                    <span className="msg-empty-sub">Start by messaging someone from a listing</span>
                  )}
                </div>
              ) : (
                filtered.map((c, i) => (
                  <div key={c.id}>
                    <div
                      className={`msg-convo-item${c.id === activeId ? " msg-convo-active" : ""}`}
                      onClick={() => setActiveId(c.id)}
                    >
                      <div className="msg-avatar">{c.initials}</div>
                      <div className="msg-convo-text">
                        <div className="msg-convo-name">{c.name}</div>
                        <div className="msg-convo-preview">{c.preview}</div>
                      </div>
                    </div>
                    {i < filtered.length - 1 && <div className="msg-convo-divider" />}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="msg-chat-panel">
            {!active ? (
              <div className="msg-no-convo-panel">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#C4CADA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="msg-no-convo-title">Your messages will appear here</span>
                <span className="msg-no-convo-sub">Browse listings and reach out to a neighbor to get started</span>
              </div>
            ) : (
              <>
            <div className="msg-chat-header">
              <div className="msg-header-avatar">{active?.initials}</div>
              <div style={{ flex: 1 }}>
                <span className="msg-header-name">{active?.name}</span>
                {active?.listingTitle && (
                  <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px" }}>
                    Re: {active.listingTitle}
                  </div>
                )}
              </div>
              {activeId && (
                <button
                  onClick={() => deleteConversation(activeId)}
                  title="Delete conversation"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    color: "#9CA3AF",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              )}
            </div>

            <div className="msg-chat-body">
              {active?.messages?.length ? (
                active.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))
              ) : (
                <div className="msg-no-messages">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>No messages yet</span>
                  <span className="msg-no-messages-sub">Say hello to start the conversation</span>
                </div>
              )}
            </div>

            <div className="msg-input-bar">
              <input
                className="msg-text-input"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="msg-send-btn" onClick={sendMessage} aria-label="Send">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon
                    points="22 2 15 22 11 13 2 9 22 2"
                    fill="white"
                    stroke="none"
                  />
                </svg>
              </button>
            </div>
            </>
            )}
          </div>
        </div>

        {error && <p style={{ marginTop: "16px", color: "#b91c1c" }}>{error}</p>}
      </div>
    </div>
  );
}