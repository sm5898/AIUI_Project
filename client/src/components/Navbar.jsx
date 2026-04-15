import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar({ active }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getInitials = () => {
    if (!user) return "GU";
    return (
      (user.firstName?.[0] || "") +
      (user.lastName?.[0] || "")
    ).toUpperCase();
  };

  return (
    <div className="navbar">
      <div className="logo">
        <div />
        <div />
        <div />
        <div />
      </div>

      <div className="nav-pill">
        <span
          className={active === "explore" ? "active" : ""}
          onClick={() => navigate("/explore")}
        >
          Explore
        </span>
        <span
          className={active === "messages" ? "active" : ""}
          onClick={() => navigate("/messages")}
        >
          Messages
        </span>
        <span
          className={active === "post" ? "active" : ""}
          onClick={() => navigate("/create")}
        >
          Post
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {user ? (
          <>
            <span style={{ fontSize: "14px" }}>
              Hi, {user.firstName}
            </span>
            <div
              className="avatar"
              onClick={() => navigate("/my-listings")}
              style={{ cursor: "pointer" }}
>
  {getInitials()}
</div>
            <button
              onClick={logout}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                color: "#555"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <span
              style={{ cursor: "pointer", fontSize: "14px" }}
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
            <div className="avatar">GU</div>
          </>
        )}
      </div>
    </div>
  );
}