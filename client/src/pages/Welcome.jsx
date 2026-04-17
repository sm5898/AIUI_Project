import React, { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "../styles/welcome.css"

const BG_PINS = [
  { top: "12%", left: "8%",  delay: 0.2,  color: "#D4703A" },  // 0
  { top: "28%", left: "22%", delay: 0.6,  color: "#4A1A0A" },  // 1
  { top: "55%", left: "5%",  delay: 1.0,  color: "#4A1A0A" },  // 2
  { top: "75%", left: "18%", delay: 0.4,  color: "#D4703A" },  // 3
  { top: "18%", left: "72%", delay: 0.8,  color: "#4A1A0A" },  // 4
  { top: "42%", left: "85%", delay: 0.3,  color: "#D4703A" },  // 5
  { top: "68%", left: "78%", delay: 1.2,  color: "#4A1A0A" },  // 6
  { top: "85%", left: "60%", delay: 0.7,  color: "#D4703A" },  // 7
  { top: "35%", left: "48%", delay: 1.4,  color: "#4A1A0A" },  // 8
  { top: "90%", left: "35%", delay: 0.5,  color: "#4A1A0A" },  // 9
]

// Each entry is [x1, y1, x2, y2] in viewBox (0–100) space
// Pins: 0(8,12) 1(22,28) 2(5,55) 3(18,75) 4(72,18) 5(85,42) 6(78,68) 7(60,85) 8(48,35) 9(35,90)
const CONSTELLATION = [
  // ── pin-to-pin network ──
  [8,12,  22,28],  // 0→1
  [22,28,  5,55],  // 1→2
  [5,55,  18,75],  // 2→3
  [8,12,  72,18],  // 0→4
  [72,18, 85,42],  // 4→5
  [85,42, 78,68],  // 5→6
  [78,68, 60,85],  // 6→7
  [22,28, 48,35],  // 1→8
  [48,35, 72,18],  // 8→4
  [48,35, 78,68],  // 8→6
  [18,75, 35,90],  // 3→9
  [35,90, 60,85],  // 9→7
  [48,35, 35,90],  // 8→9
  // ── rays to left edge ──
  [0,12,   8,12],  // → pin 0
  [0,55,   5,55],  // → pin 2
  [0,75,  18,75],  // → pin 3
  // ── rays to top edge ──
  [8,0,    8,12],  // ↓ pin 0
  [48,0,  48,35],  // ↓ pin 8
  [72,0,  72,18],  // ↓ pin 4
  [100,0, 72,18],  // corner → pin 4
  // ── rays to right edge ──
  [100,18, 85,42],  // → pin 5 (angled)
  [100,42, 85,42],  // → pin 5
  [100,68, 78,68],  // → pin 6
  // ── rays to bottom edge ──
  [60,100, 60,85],  // ↑ pin 7
  [35,100, 35,90],  // ↑ pin 9
  [0,100,  18,75],  // corner → pin 3
  [100,100,78,68],  // corner → pin 6
]

function Pin({ color = "#D4703A", size = 28 }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 22 28" fill="none">
      <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 17 11 17S22 18.667 22 11C22 4.925 17.075 0 11 0z" fill={color}/>
      <circle cx="11" cy="10" r="4" fill="white" fillOpacity="0.5"/>
    </svg>
  )
}

function useInView(threshold = 0.25) {
  const ref = useRef()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

export default function Welcome() {
  const navigate = useNavigate()
  const location = useLocation()
  const panelRef = useRef()
  const [leaving, setLeaving] = useState(false)
  const [loggedOutToast, setLoggedOutToast] = useState(false)

  useEffect(() => {
    if (location.state?.loggedOut) {
      setLoggedOutToast(true)
      setTimeout(() => setLoggedOutToast(false), 3000)
    }
  }, [])

  const [stepsRef, stepsVisible] = useInView(0.15)
  const [ctaRef, cta] = useInView(0.4)

  const triggerLeave = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => navigate("/login"), 750)
  }

  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    const onWheel = (e) => {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
      if (atBottom && e.deltaY > 0) triggerLeave()
    }
    el.addEventListener("wheel", onWheel, { passive: true })
    return () => el.removeEventListener("wheel", onWheel)
  }, [leaving])

  return (
    <div className="wl-root">
      {loggedOutToast && (
        <div className="wl-logout-toast">You've been logged out</div>
      )}
      <div ref={panelRef} className={`wl-panel${leaving ? " wl-panel--leaving" : ""}`}>

        {/* Background constellation lines */}
        <svg className="wl-bg-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {CONSTELLATION.map(([x1,y1,x2,y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="white" strokeOpacity="0.06" strokeWidth="0.15" />
          ))}
        </svg>

        {/* Background pins */}
        <div className="wl-bg-pins" aria-hidden="true">
          {BG_PINS.map((p, i) => (
            <div key={i} className="wl-bg-pin" style={{ top: p.top, left: p.left, animationDelay: `${p.delay}s` }}>
              <Pin color={p.color} size={22} />
            </div>
          ))}
        </div>

        {/* ── Skip to login ── */}
        <button className="wl-login-skip" onClick={() => navigate("/login")}>
          <svg width="11" height="14" viewBox="0 0 22 28" fill="none" style={{flexShrink:0}}>
            <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 17 11 17S22 18.667 22 11C22 4.925 17.075 0 11 0z" fill="#D4703A"/>
            <circle cx="11" cy="10" r="4" fill="white" fillOpacity="0.6"/>
          </svg>
          Log In
        </button>

        {/* ── Hero ── */}
        <section className="wl-hero">
          <p className="wl-eyebrow">Your neighborhood's shared toolbox</p>
          <h1 className="wl-hero-title">THE<br/>BLOCK</h1>
          <div className="wl-hero-scroll">
            <div className="wl-scroll-dot" />
            <span>scroll to explore</span>
          </div>
        </section>

        {/* ── Steps (3-column) ── */}
        <section className="wl-steps-section" ref={stepsRef}>
          <div className="wl-steps-grid">
            <div className={`wl-step-card${stepsVisible ? " wl-in" : ""}`} style={{ transitionDelay: "0.05s" }}>
              <div className="wl-step-pin"><Pin color="#D4703A" size={44} /></div>
              <div className="wl-step-num-label">01</div>
              <h2 className="wl-step-heading">Browse the map</h2>
              <p className="wl-step-body">Pins drop for every tool and service your neighbors are sharing — right in your block radius.</p>
            </div>
            <div className={`wl-step-card${stepsVisible ? " wl-in" : ""}`} style={{ transitionDelay: "0.2s" }}>
              <div className="wl-step-pin"><Pin color="#4A1A0A" size={44} /></div>
              <div className="wl-step-num-label">02</div>
              <h2 className="wl-step-heading">Reach out</h2>
              <p className="wl-step-body">Message a neighbor directly to arrange borrowing or book a service. No middleman, no hassle.</p>
            </div>
            <div className={`wl-step-card${stepsVisible ? " wl-in" : ""}`} style={{ transitionDelay: "0.35s" }}>
              <div className="wl-step-pin"><Pin color="#D4703A" size={44} /></div>
              <div className="wl-step-num-label">03</div>
              <h2 className="wl-step-heading">Post your own</h2>
              <p className="wl-step-body">Have something to lend or a skill to offer? Pin yourself on the map and help your block.</p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="wl-cta-section" ref={ctaRef}>
          <div className={`wl-cta-inner${cta ? " wl-in" : ""}`}>
            <button className="wl-cta-pin-btn" onClick={triggerLeave} aria-label="Start Exploring">
              <div className="wl-cta-pin-pulse" />
              <Pin color="#D4703A" size={72} />
            </button>
            <h2 className="wl-cta-heading">Ready to explore?</h2>
            <button className="wl-cta-text-btn" onClick={triggerLeave}>
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </section>

        <div className="wl-panel-handle" />
      </div>
    </div>
  )
}
