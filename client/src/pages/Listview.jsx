import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import ListingCard from "../components/Listingcard"
import ListingModal from "../components/ListingModal"
import Navbar from "../components/Navbar"
import { useSearch } from "../context/SearchContext"
import "../styles/listview.css"

export default function ListView() {
 const { filtered, query, setQuery, filter, setFilter } = useSearch()
 const navigate = useNavigate()
 const [searchOpen, setSearchOpen] = useState(false)
 const [selectedListing, setSelectedListing] = useState(null)
 const [aiQuery, setAiQuery] = useState("");
 const [aiLoading, setAiLoading] = useState(false);
 const [showAiSearch, setShowAiSearch] = useState(false);

 const handleSmartSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
        const res = await fetch('http://localhost:5001/api/ai/smart-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: aiQuery, listings: filtered }),
        });
        const data = await res.json();
        if (data.ids && data.ids.length > 0) {
            setQuery(data.ids[0]);
        }
    } catch {
        alert('Smart search failed.');
    } finally {
        setAiLoading(false);
    }
 };

 return (
  <div>
   <Navbar active="explore" />

     <div className="lv-toolbar">
        {/* AI search button/input moved below filters */}

        <div className="lv-search-overlay">
     {searchOpen ? (
      <input
       autoFocus
       className="lv-search-input"
       placeholder="Search listings..."
       value={query}
       onChange={e => setQuery(e.target.value)}
       onBlur={() => { if (!query) setSearchOpen(false) }}
      />
     ) : (
      <button className="lv-search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="22" y2="22" />
       </svg>
      </button>
     )}
    </div>

    <div className="lv-filters">
     {(filter !== "all" || query) && (
      <button
       className="lv-clear-filters-btn"
       onClick={() => { setFilter("all"); setQuery("") }}
      >
       × Clear
      </button>
     )}

     <button
      className={`lv-filter-btn${filter === "borrow" ? " lv-filter-borrow-active" : ""}`}
      onClick={() => setFilter(filter === "borrow" ? "all" : "borrow")}
     >
      Borrow
     </button>
     <button
      className={`lv-filter-btn${filter === "service" ? " lv-filter-service-active" : ""}`}
      onClick={() => setFilter(filter === "service" ? "all" : "service")}
     >
      Service
     </button>

     {/* View toggle */}
     <div className="view-toggle">
      <button className="view-toggle-btn view-toggle-active" aria-label="List view">
       <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="4" height="4" rx="0.5" fill="currentColor"/>
        <rect x="9" y="3" width="4" height="4" rx="0.5" fill="currentColor"/>
        <rect x="15" y="3" width="4" height="4" rx="0.5" fill="currentColor"/>
        <rect x="3" y="9" width="4" height="4" rx="0.5" fill="currentColor"/>
        <rect x="9" y="9" width="4" height="4" rx="0.5" fill="currentColor"/>
        <rect x="15" y="9" width="4" height="4" rx="0.5" fill="currentColor"/>
        <rect x="3" y="15" width="4" height="4" rx="0.5" fill="currentColor"/>
        <rect x="9" y="15" width="4" height="4" rx="0.5" fill="currentColor"/>
        <rect x="15" y="15" width="4" height="4" rx="0.5" fill="currentColor"/>
       </svg>
      </button>
      <button className="view-toggle-btn" onClick={() => navigate("/explore")} aria-label="Map view">
       <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="10" r="7" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 21 Q12 21 7 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M12 21 Q12 21 17 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="10" r="2.5" fill="currentColor"/>
       </svg>
      </button>
     </div>
    </div>
   </div>
     {/* AI Search UI - moved below filters so it doesn't replace the main search icon */}
     {showAiSearch && (
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder='e.g. "something to hang shelves this weekend"'
                onKeyDown={(e) => e.key === "Enter" && handleSmartSearch()}
                style={{
                    flex: 1, padding: "10px 14px", borderRadius: "24px",
                    border: "1px solid #c0622f", fontSize: "14px", outline: "none"
                }}
            />
            <button
                onClick={handleSmartSearch}
                disabled={aiLoading}
                style={{
                    background: "#0f2044", color: "#fff", border: "none",
                    borderRadius: "24px", padding: "10px 18px",
                    fontSize: "13px", cursor: "pointer",
                    opacity: aiLoading ? 0.5 : 1
                }}
            >
                {aiLoading ? "Searching..." : "Search"}
            </button>
        </div>
     )}

   {selectedListing && (
    <ListingModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
   )}

   <div className="grid-list">
    {filtered.map(item => (
     <ListingCard key={item._id} listing={item} onClick={() => setSelectedListing(item)} />
    ))}
    {filtered.length === 0 && (
     <p className="lv-empty">No listings match your search.</p>
    )}
   </div>
  </div>
 )
}