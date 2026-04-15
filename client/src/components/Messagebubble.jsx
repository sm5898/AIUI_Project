import React from "react"
import "../styles/layouts.css"

export default function MessageBubble({ message }) {
 const isSent = message.sender === "me"

 return (
  <div className={`msg-bubble-wrap${isSent ? " msg-bubble-sent-wrap" : ""}`}>
   <div className={`msg-bubble${isSent ? " msg-bubble-sent" : " msg-bubble-received"}`}>
    <span className="msg-bubble-text">{message.text}</span>
    <span className="msg-bubble-time">{message.time}</span>
   </div>
  </div>
 )
}