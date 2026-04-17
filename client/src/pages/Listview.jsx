import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import ListingCard from "../components/Listingcard"
import Navbar from "../components/Navbar"
import { useSearch } from "../context/SearchContext"
import "../styles/listview.css"

export default function ListView() {
 const { 
  filtered, 
  query, 
  setQuery, 
  filter, 
  setFilter, 
  availability,
  setAvailability,
  radius,
  setRadius,
  enableDistance,
  setEnableDistance,
  clearFilters,
  userLocation
 } = useSearch()
 const navigate = useNavigate()
 const [searchOpen, setSearchOpen] = useState(false)
 const [filtersOpen, setFiltersOpen] = useState(false)

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

     {/* Advanced filters button */}
     <button 
      className="lv-advanced-filters-btn"
      onClick={() => setFiltersOpen(!filtersOpen)}
      title="Advanced filters"
     >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
       <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z"/>
      </svg>
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

    {/* Advanced Filters Panel */}
    {filtersOpen && (
     <div className="lv-advanced-filters-panel">
      <div className="lv-filter-row">
       <label>Availability:</label>
       <select 
        value={availability} 
        onChange={(e) => setAvailability(e.target.value)}
        className="lv-filter-select"
       >
        <option value="all">All Availability</option>
        <option value="Weekdays">Weekdays</option>
        <option value="Weekends">Weekends</option>
        <option value="Evenings">Evenings</option>
        <option value="Mornings">Mornings</option>
        <option value="Anytime">Anytime</option>
       </select>
      </div>

      {userLocation && (
       <div className="lv-filter-row">
        <label>
         <input 
          type="checkbox"
          checked={enableDistance}
          onChange={(e) => setEnableDistance(e.target.checked)}
         />
         Search by Distance ({radius} miles)
        </label>
        {enableDistance && (
         <input 
          type="range" 
          min="1" 
          max="50" 
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="lv-radius-slider"
         />
        )}
       </div>
      )}

      <div className="lv-filter-actions">
       <button 
        onClick={clearFilters}
        className="lv-clear-filters-btn"
       >
        Clear All Filters
       </button>
      </div>
     </div>
    )}
   </div>

   <div className="grid-list">
    {filtered.map(item => (
     <div key={item._id} className="listing-card-with-distance">
      <ListingCard listing={item} />
      {item.distance && (
       <div className="card-distance-badge">
        {item.distance.toFixed(1)} mi away
       </div>
      )}
     </div>
    ))}
    {filtered.length === 0 && (
     <p className="lv-empty">No listings match your search.</p>
    )}
   </div>
  </div>
 )
}