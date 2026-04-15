import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import signupPhoto from "../../Images/signUp_image.png";
import "../styles/signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: ""
  });
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
        password: form.password
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/success");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="su-layout">
      <div className="su-photo-panel">
        <img src={signupPhoto} alt="" className="su-photo" />
      </div>

      <div className="su-form-panel">
        <form className="su-form" onSubmit={handleSubmit}>
          <h1 className="su-title">Sign Up</h1>
          <div className="su-divider" />
          <p className="su-subtitle">Lets get you started</p>

          <label className="su-label" htmlFor="su-email">
            Email ID <span className="su-arrow">→</span>
          </label>
          <input
            id="su-email"
            type="email"
            className="su-input"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <label className="su-label" htmlFor="su-first">
            First Name <span className="su-arrow">→</span>
          </label>
          <input
            id="su-first"
            className="su-input"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />

          <label className="su-label" htmlFor="su-last">
            Last Name <span className="su-arrow">→</span>
          </label>
          <input
            id="su-last"
            className="su-input"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />

          <label className="su-label" htmlFor="su-pass">
            Password <span className="su-arrow">→</span>
          </label>
          <input
            id="su-pass"
            type="password"
            className="su-input"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <label className="su-label" htmlFor="su-confirm">
            Confirm Password <span className="su-arrow">→</span>
          </label>
          <input
            id="su-confirm"
            type="password"
            className="su-input"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
          />

          {error && <p className="su-error">{error}</p>}

          <div className="su-btn-row">
            <button type="submit" className="su-btn" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}