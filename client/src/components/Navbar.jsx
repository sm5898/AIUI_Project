import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar({ active, locked, showSearch, searchProps }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    <>
      <div className={`navbar ${showSearch ? "navbar-transparent" : ""}`}>
        <div className="logo">
          <div /><div /><div /><div />
        </div>

        {showSearch ? (
          <div className="navbar-search-wrap" ref={searchProps?.searchRef}>
            <div style={{ position: "relative" }}>
              <input
                className="navbar-search-input"
                placeholder="What are you looking to borrow or hire?"
                value={searchProps?.query || ""}
                onChange={searchProps?.handleSearchChange}
              />
              <svg
                style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
              {searchProps?.showSuggestions && searchProps?.suggestions?.length > 0 && (
                <div className="navbar-search-dropdown">
                  {searchProps.suggestions.map(item => (
                    <div
                      key={item._id}
                      onClick={() => searchProps.handleSuggestionClick(item)}
                      className="navbar-search-item"
                      onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                      <span className="navbar-search-tag" style={{
                        background: item.type === "service" ? "#4A1A0A" : "#D4703A"
                      }}>
                        {item.type === "service" ? "Service" : "Borrow"}
                      </span>
                      {item.title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="navbar-filter-pills">
              <button
                className={`navbar-pill${searchProps?.filter === "borrow" ? " navbar-pill-borrow-active" : " navbar-pill-borrow"}`}
                onClick={() => searchProps?.setFilter(searchProps?.filter === "borrow" ? "all" : "borrow")}
              >Borrow</button>
              <button
                className={`navbar-pill${searchProps?.filter === "service" ? " navbar-pill-service-active" : " navbar-pill-service"}`}
                onClick={() => searchProps?.setFilter(searchProps?.filter === "service" ? "all" : "service")}
              >Service</button>

              {/* Distance slider */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", borderLeft: "1px solid #e5e7eb", paddingLeft: "12px" }}>
                <span style={{ fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap", fontWeight: "600" }}>
                  Filter distance
                </span>
                <div style={{ position: "relative", width: "90px" }}>
                  <div style={{
                    position: "absolute",
                    top: "-20px",
                    left: `${((searchProps?.distanceFilter || 5) - 0.1) / (5 - 0.1) * 100}%`,
                    transform: "translateX(-50%)",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#0B1F44",
                    whiteSpace: "nowrap"
                  }}>
                    {searchProps?.distanceFilter || 5} mi
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={searchProps?.distanceFilter || 5}
                    onChange={e => searchProps?.setDistanceFilter(parseFloat(e.target.value))}
                    onMouseDown={e => e.stopPropagation()}
                    onTouchStart={e => e.stopPropagation()}
                    style={{ width: "90px", accentColor: "#0B1F44", cursor: "pointer", position: "relative", zIndex: 9999 }}
                  />
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </div>

              {(searchProps?.filter !== "all" || searchProps?.query || searchProps?.distanceFilter !== 5) && (
                <button className="navbar-clear-btn" onClick={searchProps?.handleClear}>× Clear filters</button>
              )}
            </div>
          </div>
        ) : (
          <div className="nav-pill">
            <span className={active === "explore" ? "active" : ""} onClick={() => go("/explore")}>Explore</span>
            <span className={active === "messages" ? "active" : ""} onClick={() => go("/messages")}>Messages</span>
            <span className={active === "post" ? "active" : ""} onClick={() => go("/create")}>Post</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <div className="nb-avatar-wrap" ref={dropdownRef}>
              <div className="avatar" onClick={() => setDropdownOpen(o => !o)} style={{ cursor: "pointer" }}>
                {getInitials()}
              </div>
              {dropdownOpen && (
                <div className="nb-dropdown">
                  <button className="nb-dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/profile"); }}>View Profile</button>
                  <div className="nb-dropdown-divider" />
                  <button className="nb-dropdown-item nb-dropdown-item--danger" onClick={logout}>Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <span style={{ cursor: "pointer", fontSize: "14px" }} onClick={() => go("/signup")}>Sign Up</span>
              <div className="avatar">GU</div>
            </>
          )}
        </div>
      </div>

      {toast && <div className="nav-toast">Log in or create an account to explore</div>}
    </>
  )
}