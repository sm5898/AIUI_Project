import { useState, useRef, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AIChatBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    { role: "assistant", text: "Hey! I'm your Block assistant 👋 Ask me anything — finding tools, posting listings, or how the app works!" }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, open]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newHistory = [...history, { role: "user", text: trimmed }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data = await res.json();
      console.log('AI response:', data);
      const reply = data.reply || data.error || 'Sorry, I could not get a response.';
      setHistory([...newHistory, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('AI chat error:', err);
      setHistory([
        ...newHistory,
        { role: 'assistant', text: err?.message || 'Sorry, something went wrong. Try again!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, fontFamily: "inherit" }}>
      {/* Chat Panel */}
      {open && (
        <div style={{
          width: "340px",
          height: "460px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          marginBottom: "12px",
          overflow: "hidden",
          border: "1px solid #e5e7eb"
        }}>
          {/* Header */}
          <div style={{
            background: "#0f2044",
            color: "#fff",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>🤖</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>Block Assistant</div>
                <div style={{ fontSize: "11px", opacity: 0.7 }}>Powered by Gemini AI</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: "none", border: "none", color: "#fff",
              fontSize: "20px", cursor: "pointer", lineHeight: 1
            }}>×</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "14px",
            display: "flex", flexDirection: "column", gap: "10px"
          }}>
            {history.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "9px 13px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.role === "user" ? "#0f2044" : "#f3f4f6",
                  color: msg.role === "user" ? "#fff" : "#1a1a1a",
                  fontSize: "13px",
                  lineHeight: "1.5"
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  background: "#f3f4f6", borderRadius: "14px 14px 14px 4px",
                  padding: "9px 13px", fontSize: "13px", color: "#888"
                }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid #e5e7eb",
            display: "flex", gap: "8px", alignItems: "center"
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything..."
              style={{
                flex: 1, padding: "9px 12px", borderRadius: "20px",
                border: "1px solid #d1d5db", fontSize: "13px",
                outline: "none", background: "#f9fafb"
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: '#c0622f', border: 'none', borderRadius: '20px',
                padding: '8px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                opacity: loading || !input.trim() ? 0.5 : 1,
                color: '#fff', fontSize: '13px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
              </svg>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Bubble Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "#c0622f", border: "none", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(192,98,47,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px", transition: "transform 0.2s",
          transform: open ? "rotate(90deg)" : "rotate(0deg)"
        }}
      >
        {open ? "×" : "🤖"}
      </button>
    </div>
  );
}
