import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/modal.css"

const BORROW_COLOR = "#D4703A"
const SERVICE_COLOR = "#4A1A0A"

export default function ListingModal({ listing, onClose }) {
  const navigate = useNavigate()

  const isBorrow = listing.type === "lend" || listing.type === "borrow"
  const accentColor = isBorrow ? BORROW_COLOR : SERVICE_COLOR
  const typeLabel = isBorrow ? "Borrow" : "Service"
  const postedBy = listing.createdBy || listing.postedBy || "A neighbor"

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  // Prevent body scroll while open
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
        {/* Close button */}
        <button className="lm-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Type row */}
        <div className="lm-type-row">
          <span className="lm-type-label">{typeLabel}</span>
        </div>

        {/* Title + distance */}
        <div className="lm-title-row">
          <h2 className="lm-title">{listing.title}</h2>
          {listing.distance && (
            <span className="lm-dist">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {listing.distance}
            </span>
          )}
        </div>

        {/* Photo */}
        {listing.image && (
          <img className="lm-img" src={listing.image} alt={listing.title} />
        )}

        {/* Description */}
        {listing.description && (
          <p className="lm-desc">{listing.description}</p>
        )}

        {/* Company */}
        {listing.company && (
          <p className="lm-meta"><strong>Company:</strong> {listing.company}</p>
        )}

        {/* Availability */}
        {listing.availability && (
          <p className="lm-meta"><strong>Availability:</strong> {listing.availability}</p>
        )}

        <hr className="lm-divider" />

        {/* Footer */}
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
