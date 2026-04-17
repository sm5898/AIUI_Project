import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/onboarding.css"

const STEPS = [
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#D4703A" fillOpacity="0.15"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 8.4 12 20 12 20S24 20.4 24 12C24 5.373 18.627 0 12 0z" fill="#D4703A"/>
        <circle cx="12" cy="11" r="4.5" fill="white" fillOpacity="0.7"/>
      </svg>
    ),
    badge: "🎉 You're officially on the block!",
    title: "Welcome to THE BLOCK",
    description:
      "Your neighborhood sharing network. Borrow tools, offer services, and connect with the people right around you — all in one place.",
  },
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="12" fill="#0B1F44" fillOpacity="0.1"/>
        <circle cx="12" cy="10" r="6" stroke="#0B1F44" strokeWidth="1.8"/>
        <path d="M12 20 Q12 20 8 15" stroke="#0B1F44" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 20 Q12 20 16 15" stroke="#0B1F44" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="10" r="2.5" fill="#0B1F44"/>
        <rect x="3" y="3" width="3" height="3" rx="0.5" fill="#D4703A"/>
        <rect x="18" y="3" width="3" height="3" rx="0.5" fill="#D4703A"/>
        <rect x="3" y="18" width="3" height="3" rx="0.5" fill="#D4703A"/>
      </svg>
    ),
    title: "Explore Your Neighborhood",
    description:
      "Switch between Map view and List view to browse what's available nearby. Use the search bar or filter by Borrow or Service to find exactly what you need.",
  },
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="12" fill="#D4703A" fillOpacity="0.12"/>
        <circle cx="12" cy="12" r="9" stroke="#D4703A" strokeWidth="1.8"/>
        <line x1="12" y1="7" x2="12" y2="17" stroke="#D4703A" strokeWidth="2" strokeLinecap="round"/>
        <line x1="7" y1="12" x2="17" y2="12" stroke="#D4703A" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Post a Listing",
    description:
      "Have something to lend or a skill to share? Tap the + button in the nav to create a listing. Choose Borrow for items or Service for skills, add a photo, and you're live.",
  },
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="12" fill="#4A1A0A" fillOpacity="0.1"/>
        <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6l-4 3V6a2 2 0 0 1 2-2z" stroke="#4A1A0A" strokeWidth="1.8" strokeLinejoin="round"/>
        <line x1="8" y1="10" x2="16" y2="10" stroke="#4A1A0A" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="8" y1="13.5" x2="13" y2="13.5" stroke="#4A1A0A" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    title: "Message Neighbors",
    description:
      "Interested in a listing? Send a message directly to the poster. Your inbox keeps all conversations organized so nothing gets lost.",
  },
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="12" fill="#0B1F44" fillOpacity="0.1"/>
        <circle cx="12" cy="8" r="4" stroke="#0B1F44" strokeWidth="1.8"/>
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#0B1F44" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Manage Your Profile",
    description:
      "Visit your profile to update your info and view your active listings. Tap My Listings in the nav to see everything you've posted in one place.",
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  useEffect(() => {
    // If not a new user, skip onboarding
    const isNew = localStorage.getItem("isNewUser")
    if (!isNew) {
      navigate("/explore", { replace: true })
      return
    }
    // Clear the flag immediately so revisiting this page skips it
    localStorage.removeItem("isNewUser")
  }, [navigate])

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  return (
    <div className="ob-root">
      <div className="ob-card">
        <div className="ob-icon">{current.icon}</div>
        {current.badge && <div className="ob-badge">{current.badge}</div>}
        <h2 className="ob-title">{current.title}</h2>
        <p className="ob-desc">{current.description}</p>

        <div className="ob-dots">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`ob-dot${i === step ? " ob-dot-active" : ""}`}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <div className="ob-actions">
          {step > 0 && (
            <button className="ob-btn ob-btn-back" onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          )}
          {isLast ? (
            <button className="ob-btn ob-btn-primary" onClick={() => navigate("/explore")}>
              Get Started
            </button>
          ) : (
            <button className="ob-btn ob-btn-primary" onClick={() => setStep(s => s + 1)}>
              Next
            </button>
          )}
        </div>

        {!isLast && (
          <button className="ob-skip" onClick={() => navigate("/explore")}>
            Skip guide
          </button>
        )}
      </div>
    </div>
  )
}
