import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/landing.css";

function Pin({ color = "#D4703A", size = 22 }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 22 28" fill="none">
      <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 17 11 17S22 18.667 22 11C22 4.925 17.075 0 11 0z" fill={color}/>
      <circle cx="11" cy="10" r="4" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter your email and password");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/explore");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") login(); };

  return (
    <div className="ln-root">

      {/* ── Left — navy brand panel ── */}
      <div className="ln-left">
        <div className="ln-left-content">
          <p className="ln-eyebrow">Your neighborhood's shared toolbox</p>
          <h1 className="ln-title">THE<br/>BLOCK</h1>
          <div className="ln-deco-pin">
            <Pin color="#D4703A" size={72} />
          </div>
        </div>
        <button className="ln-back-link" onClick={() => navigate("/")}>← Back to home</button>
      </div>

      {/* ── Right — white form panel ── */}
      <div className="ln-right">
        <div className="ln-form">
          <div className="ln-form-header">
            <h2 className="ln-form-title">Welcome back</h2>
            <a className="ln-signup-link" href="/signup">
              <span>New here? Sign up</span>
              <span className="ln-signup-arrow">→</span>
            </a>
          </div>

          <label className="ln-label">Email <span className="ln-arrow">→</span></label>
          <input
            className="ln-input"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            onKeyDown={handleKey}
          />

          <label className="ln-label">Password <span className="ln-arrow">→</span></label>
          <div className="ln-input-wrap">
            <input
              className="ln-input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={handleKey}
            />
            <button type="button" className="ln-eye-btn" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {error && <p className="ln-error">{error}</p>}

          <button className="ln-btn" onClick={login} disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Log In"}
          </button>
        </div>
      </div>

    </div>
  );
}

