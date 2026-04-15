import React, { useState } from "react"
import Navbar from "../components/Navbar"
import MessageBubble from "../components/Messagebubble"
import "../styles/layouts.css"

export default function Messages() {
 const [activeId, setActiveId] = useState(null)
 const [search, setSearch] = useState("")
 const [input, setInput] = useState("")
 const [conversations, setConversations] = useState([])

 const active = conversations.find(c => c.id === activeId)

 const filtered = conversations.filter(c => {
  const q = search.toLowerCase()
  if (!q) return true
  const nameMatch = c.name.toLowerCase().includes(q)
  const messageMatch = c.messages.some(m => m.text.toLowerCase().includes(q))
  return nameMatch || messageMatch
 })

 const sendMessage = () => {
  if (!input.trim()) return
  setConversations(prev => prev.map(c =>
   c.id === activeId
    ? { ...c, messages: [...c.messages, { id: Date.now(), sender: "me", text: input.trim(), time: "now" }] }
    : c
  ))
  setInput("")
 }

 const handleKeyDown = (e) => {
  if (e.key === "Enter") sendMessage()
 }

 return (
  <div className="msg-page">
   <Navbar active="messages" />

   <div className="msg-outer">
    <h1 className="msg-heading">Conversations</h1>

    <div className="msg-layout">
     {/* LEFT SIDEBAR */}
     <div className="msg-sidebar">
      <div className="msg-search-wrap">
       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="22" y2="22" />
       </svg>
       <input
        className="msg-search-input"
        placeholder="Search"
        value={search}
        onChange={e => setSearch(e.target.value)}
       />
      </div>

      <div className="msg-convo-list">
       {filtered.length === 0 ? (
        <div className="msg-empty">
         <p>No conversations yet</p>
         <button className="msg-new-btn" onClick={() => alert("New conversation flow coming soon!")}>New conversation</button>
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

     {/* RIGHT CHAT PANEL */}
     <div className="msg-chat-panel">
      <div className="msg-chat-header">
       <div className="msg-header-avatar">{active?.initials}</div>
       <span className="msg-header-name">{active?.name}</span>
      </div>

      <div className="msg-chat-body">
       {active?.messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
       ))}
      </div>

      <div className="msg-input-bar">
       <button className="msg-plus-btn" aria-label="Attach">+</button>
       <input
        className="msg-text-input"
        placeholder=""
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
       />
       <button className="msg-send-btn" onClick={sendMessage} aria-label="Send">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
         <line x1="22" y1="2" x2="11" y2="13" />
         <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="none" />
        </svg>
       </button>
      </div>
     </div>
    </div>
   </div>
  </div>
 )
}