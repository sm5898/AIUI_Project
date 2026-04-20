import { useState, useRef, useEffect } from "react";
import "../styles/aichat.css";

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
    <div className="ai-bubble-root">
      {/* Chat Panel */}
      {open && (
        <div className="ai-panel">
          {/* Header */}
          <div className="ai-panel-header">
            <div className="ai-panel-header-left">
              <div>
                <div className="ai-panel-title">Block Assistant</div>
                <div className="ai-panel-subtitle">Powered by Gemini AI</div>
              </div>
            </div>
            <button className="ai-panel-close" onClick={() => setOpen(false)}>×</button>
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {history.map((msg, i) => (
              <div key={i} className={`ai-message-row ai-message-row--${msg.role}`}>
                <div className={`ai-bubble ai-bubble--${msg.role}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-thinking">
                <div className="ai-thinking-bubble">Thinking...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="ai-input-bar">
            <input
              className="ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything..."
            />
            <button
              className="ai-send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
              </svg>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button className="ai-trigger-btn" onClick={() => setOpen(!open)}>
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4L16 16M16 4L4 16" stroke="white" strokeWidth="2.3" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M5 5C3.34 5 2 6.34 2 8V20C2 21.66 3.34 23 5 23H8.5V28.5L15.5 23H27C28.66 23 30 21.66 30 20V8C30 6.34 28.66 5 27 5H5Z" fill="white" fillOpacity="0.95"/>
            <circle cx="11" cy="14" r="2" fill="#0B1F44"/>
            <circle cx="16" cy="14" r="2" fill="#0B1F44"/>
            <circle cx="21" cy="14" r="2" fill="#0B1F44"/>
          </svg>
        )}
      </button>
    </div>
  );
}
