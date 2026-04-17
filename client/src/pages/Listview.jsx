import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import ListingCard from "../components/Listingcard"
import Navbar from "../components/Navbar"
import { useSearch } from "../context/SearchContext"
import "../styles/listview.css"

export default function ListView() {
 const { filtered, query, setQuery, filter, setFilter } = useSearch()
 const navigate = useNavigate()
 const [searchOpen, setSearchOpen] = useState(false)

 return (
  <div>
   <Navbar active="explore" />

   <div className="lv-toolbar">
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

   <div className="grid-list">
    {filtered.map(item => (
     <ListingCard key={item._id} listing={item} />
    ))}
    {filtered.length === 0 && (
     <p className="lv-empty">No listings match your search.</p>
    )}
   </div>
  </div>
 )
}