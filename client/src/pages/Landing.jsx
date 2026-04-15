import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/api";

import "../styles/landing.css";

export default function Landing() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

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
        password: form.password
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

  return (
    <div className="landing-bg">
      <Navbar locked />
      <div className="landing-hero">
        <div className="landing-left">
          <div className="block-card">
            <div className="landing-sub">Your neighborhood's shared toolbox</div>
            <div className="landing-title">THE BLOCK</div>
          </div>
        </div>
        <div className="landing-login-card">
          <div className="login-header-row">
            <h2 className="login-title">Log In</h2>
            <a className="new-user-link" href="/signup">New User?</a>
          </div>
          <div className="login-label">Username/Email <span className="arrow">→</span></div>
          <input
            className="login-input"
            placeholder="Enter your email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <div className="login-label">Password <span className="arrow">→</span></div>
          <input
            className="login-input"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="login-error">{error}</p>}
          <button className="login-btn" onClick={login} disabled={isSubmitting}>
            {isSubmitting ? "Logging In..." : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}