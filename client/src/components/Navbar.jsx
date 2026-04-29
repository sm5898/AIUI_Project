import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar({ active, locked }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (path) => {
    if (locked) {
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } else {
      navigate(path);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    navigate("/", { state: { loggedOut: true } });
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

      {/* Desktop nav pill */}
      <div className="nav-pill nav-pill--desktop">
        <span
          className={active === "explore" ? "active" : ""}
          onClick={() => go("/explore")}
        >
          Explore
        </span>
        <span
          className={active === "messages" ? "active" : ""}
          onClick={() => go("/messages")}
        >
          Messages
        </span>
        <span
          className={active === "post" ? "active" : ""}
          onClick={() => go("/create")}
        >
          Post
        </span>
      </div>

      <div className="nb-right">
        {/* Hamburger — mobile only */}
        <button
          className="nb-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>

        {user ? (
          <div className="nb-avatar-wrap" ref={dropdownRef}>
            <div
              className="avatar"
              onClick={() => setDropdownOpen(o => !o)}
            >
              {getInitials()}
            </div>
            {dropdownOpen && (
              <div className="nb-dropdown">
                <button className="nb-dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/profile"); }}>
                  View Profile
                </button>
                <div className="nb-dropdown-divider" />
                <button className="nb-dropdown-item nb-dropdown-item--danger" onClick={logout}>
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <span
              className="nb-signup-link"
              onClick={() => go("/signup")}
            >
              Sign Up
            </span>
            <div className="avatar">GU</div>
          </>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="nb-mobile-menu">
          <span onClick={() => { go("/explore"); setMenuOpen(false); }} className={active === "explore" ? "active" : ""}>Explore</span>
          <span onClick={() => { go("/messages"); setMenuOpen(false); }} className={active === "messages" ? "active" : ""}>Messages</span>
          <span onClick={() => { go("/create"); setMenuOpen(false); }} className={active === "post" ? "active" : ""}>Post</span>
        </div>
      )}

      {toast && (
        <div className="nav-toast">Log in or create an account to explore</div>
      )}
    </div>
  );
}