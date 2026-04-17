import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/modal.css"

const BORROW_COLOR = "#D4703A"
const SERVICE_COLOR = "#4A1A0A"

export default function ListingModal({ listing, onClose, distance }) {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const isBorrow = listing.type === "lend" || listing.type === "borrow"
  const accentColor = isBorrow ? BORROW_COLOR : SERVICE_COLOR
  const typeLabel = isBorrow ? "Borrow" : "Service"
  const postedBy = listing.createdBy || listing.postedBy || "A neighbor"

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <div className="lm-backdrop" onClick={onClose}>
      <div
        className="lm-card"
        style={{ borderColor: accentColor }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="lm-header-bar" style={{ background: accentColor }}>
          <span className="lm-header-title">{listing.title}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setSaved(!saved)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              title="Save listing"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "white" : "none"} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <button className="lm-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* Type + distance row */}
        <div className="lm-type-row">
  {distance && (
    <span className="lm-dist">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      {distance}
    </span>
  )}
</div>

        {listing.image && (
          <img className="lm-img" src={listing.image} alt={listing.title} />
        )}
        {listing.description && (
          <p className="lm-desc">{listing.description}</p>
        )}
        {listing.company && (
          <p className="lm-meta"><strong>Company:</strong> {listing.company}</p>
        )}
        {listing.availability && (
          <p className="lm-meta"><strong>Availability:</strong> {listing.availability}</p>
        )}
        <hr className="lm-divider" />
        <div className="lm-footer">
          <div className="lm-avatar" style={{ background: accentColor }}>
            {postedBy[0].toUpperCase()}
          </div>
          <span className="lm-posted">Posted by <strong>{postedBy}</strong></span>
          <button
            className="lm-msg-btn"
            onClick={() => navigate("/messages")}
          >
            Message {postedBy}
          </button>
        </div>
      </div>
    </div>
  )
}