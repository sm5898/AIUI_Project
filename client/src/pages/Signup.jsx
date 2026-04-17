import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/signup.css";

function Pin({ color = "#D4703A", size = 20 }) {
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

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.firstName || !form.lastName || !form.password || !form.confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await api.post("/auth/signup", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("isNewUser", "true");
      navigate("/onboarding");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="su-root">

      {/* ── Left — cream form panel ── */}
      <div className="su-left">
        <div className="su-form-wrap">
          <div className="su-form-header">
            <div>
              <h2 className="su-form-title">Create account</h2>
              <p className="su-form-sub">Let's get you on the block</p>
            </div>
            <a className="su-login-link" href="/login">
              <span>Sign in instead</span>
              <span className="su-login-arrow">→</span>
            </a>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="su-name-row">
              <div className="su-field">
                <label className="su-label" htmlFor="su-first">First <span className="su-arrow">→</span></label>
                <input id="su-first" className="su-input" value={form.firstName} onChange={e => update("firstName", e.target.value)} />
              </div>
              <div className="su-field">
                <label className="su-label" htmlFor="su-last">Last <span className="su-arrow">→</span></label>
                <input id="su-last" className="su-input" value={form.lastName} onChange={e => update("lastName", e.target.value)} />
              </div>
            </div>

            <label className="su-label" htmlFor="su-email">Email <span className="su-arrow">→</span></label>
            <input id="su-email" type="email" className="su-input su-input--full" value={form.email} onChange={e => update("email", e.target.value)} />

            <label className="su-label" htmlFor="su-pass">Password <span className="su-arrow">→</span></label>
            <div className="su-input-wrap">
              <input id="su-pass" type={showPassword ? "text" : "password"} className="su-input su-input--full" value={form.password} onChange={e => update("password", e.target.value)} />
              <button type="button" className="su-eye-btn" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <label className="su-label" htmlFor="su-confirm">Confirm Password <span className="su-arrow">→</span></label>
            <div className="su-input-wrap">
              <input id="su-confirm" type={showConfirm ? "text" : "password"} className="su-input su-input--full" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} />
              <button type="button" className="su-eye-btn" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Hide password" : "Show password"}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>

            {error && <p className="su-error">{error}</p>}

            <button type="submit" className="su-btn" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Sign Up"}
            </button>
          </form>
        </div>
        <button className="su-back-link" onClick={() => navigate("/")}>← Back to home</button>
      </div>

      {/* ── Right — navy brand panel ── */}
      <div className="su-right">
        <div className="su-right-content">
          <p className="su-eyebrow">Your neighborhood's shared toolbox</p>
          <h1 className="su-title">THE<br/>BLOCK</h1>
          <div className="su-pin-row">
            <Pin color="#D4703A" size={36} />
            <Pin color="#4A1A0A" size={28} />
            <Pin color="#D4703A" size={22} />
          </div>
          <p className="su-right-tagline">Borrow tools. Share skills.<br/>Know your block.</p>
        </div>
      </div>

    </div>
  );
}