import React from "react";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const firstName = user?.firstName || user?.name?.split(" ")[0] || "neighbor";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B1F44",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      padding: "40px"
    }}>
      {/* Logo dots */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 12px)",
        gap: "6px",
        marginBottom: "16px"
      }}>
        <div style={{ width: 12, height: 12, background: "white", borderRadius: "50%" }} />
        <div style={{ width: 12, height: 12, background: "white", borderRadius: "50%" }} />
        <div style={{ width: 12, height: 12, background: "white", borderRadius: "50%" }} />
        <div style={{ width: 12, height: 12, background: "white", borderRadius: "50%" }} />
      </div>

      {/* Pin icon */}
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "8px"
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#D4703A"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      </div>

      <h1 style={{
        fontSize: "36px", fontWeight: 800, color: "white",
        margin: 0, textAlign: "center"
      }}>
        Welcome, {firstName}! 👋
      </h1>

      <p style={{
        fontSize: "18px", color: "rgba(255,255,255,0.7)",
        margin: 0, textAlign: "center", maxWidth: "400px", lineHeight: 1.6
      }}>
        Your account is all set. Start exploring what your neighbors have to offer.
      </p>

      <button
        onClick={() => navigate("/explore")}
        style={{
          marginTop: "16px",
          background: "#D4703A", color: "white", border: "none",
          padding: "16px 48px", borderRadius: "999px",
          fontSize: "16px", fontWeight: "700", cursor: "pointer"
        }}
      >
        Start Exploring →
      </button>
    </div>
  )
}