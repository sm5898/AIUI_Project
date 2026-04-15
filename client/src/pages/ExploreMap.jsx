import React, { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, ZoomControl, Popup, useMap } from "react-leaflet"
import { useNavigate } from "react-router-dom"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import Navbar from "../components/Navbar"
import { useSearch } from "../context/SearchContext"
import "../styles/map.css"

const SERVICE_COLOR = "#4A1A0A"
const BORROW_COLOR = "#D4703A"

function createPinIcon(color, title) {
  return L.divIcon({
    className: "",
    html: `
      <div class="map-pin">
        <svg width="22" height="28" viewBox="0 0 22 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 17 11 17S22 18.667 22 11C22 4.925 17.075 0 11 0z" fill="${color}"/>
          <circle cx="11" cy="10" r="4" fill="white" fill-opacity="0.65"/>
        </svg>
        <div class="map-pin-label" style="background:${color}">${title}</div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [11, 28],
  })
}

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center)
  }, [center])
  return null
}

function FlyToListing({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo([target.location.lat, target.location.lng], 17, { duration: 1 })
    }
  }, [target])
  return null
}

export default function ExploreMap() {
  const { filtered, query, setQuery, filter, setFilter } = useSearch()
  const [searchOpen, setSearchOpen] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([40.724, -73.984])
  const [selectedListing, setSelectedListing] = useState(null)
  const [saved, setSaved] = useState(false)
  const [flyTarget, setFlyTarget] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setMapCenter([pos.coords.latitude, pos.coords.longitude])
      },
      err => console.log("Location not available")
    )
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSearchChange(e) {
    const val = e.target.value
    setQuery(val)
    if (val.length > 0) {
      const matches = filtered.filter(item =>
        item.title?.toLowerCase().includes(val.toLowerCase())
      )
      setSuggestions(matches)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  function handleSuggestionClick(item) {
    setQuery(item.title)
    setShowSuggestions(false)
    setFlyTarget(item)
  }

  function getDistance(lat1, lng1, lat2, lng2) {
    const R = 3958.8
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1)
  }

  const mapListings = filtered.filter(
    item => item.location?.lat && item.location?.lng
  )

  return (
    <div className="map-page">
      <Navbar active="explore" />
      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={17}
          className="map-container"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
          <ZoomControl position="bottomright" />
          <RecenterMap center={mapCenter} />
          <FlyToListing target={flyTarget} />
          {mapListings.map(item => (
            <Marker
              key={item._id}
              position={[item.location.lat, item.location.lng]}
              icon={createPinIcon(
                item.type?.toLowerCase() === "service" ? SERVICE_COLOR : BORROW_COLOR,
                item.title
              )}
            >
              <Popup>
                <div style={{ minWidth: "200px", fontFamily: "Inter, Arial, sans-serif" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "600", fontSize: "14px", color: "#0B1F44" }}>{item.title}</span>
                    {userLocation && (
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>
                        📍 {getDistance(userLocation.lat, userLocation.lng, item.location.lat, item.location.lng)} mi away
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#374151", lineHeight: "1.4" }}>
                    {item.description}
                  </p>
                  {item.availability && (
                    <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280" }}>
                      🕐 {item.availability}
                    </p>
                  )}
                  <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #eee" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: "#0B1F44", display: "flex", alignItems: "center",
                      justifyContent: "center", color: "white", fontSize: "12px", fontWeight: "600",
                      flexShrink: 0
                    }}>
                      {item.createdBy ? item.createdBy.toString().slice(0,2).toUpperCase() : "?"}
                    </div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Posted by: <strong style={{ color: "#0B1F44" }}>{item.createdBy || "Anonymous"}</strong>
                    </span>
                  </div>
                  <span
                    style={{ fontSize: "12px", color: "#D4703A", cursor: "pointer", fontWeight: "500" }}
                    onClick={() => { setSelectedListing(item); setSaved(false) }}
                  >
                    Click to view more details →
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Search button + dropdown */}
        <div className="map-search-overlay" ref={searchRef}>
          {searchOpen ? (
            <div style={{ position: "relative" }}>
              <input
                autoFocus
                className="map-search-input"
                placeholder="Search your neighborhood..."
                value={query}
                onChange={handleSearchChange}
                onBlur={() => { if (!query) setSearchOpen(false) }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "110%", left: 0, width: "100%",
                  background: "white", borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 1001,
                  overflow: "hidden"
                }}>
                  {suggestions.map(item => (
                    <div
                      key={item._id}
                      onClick={() => handleSuggestionClick(item)}
                      style={{
                        padding: "10px 16px", cursor: "pointer", fontSize: "14px",
                        color: "#0B1F44", display: "flex", alignItems: "center", gap: "8px",
                        borderBottom: "1px solid #f3f4f6"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                      <span style={{
                        fontSize: "11px", color: "white", padding: "2px 8px",
                        borderRadius: "999px", flexShrink: 0,
                        background: item.type === "service" ? SERVICE_COLOR : BORROW_COLOR
                      }}>
                        {item.type === "service" ? "Service" : "Borrow"}
                      </span>
                      {item.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button className="map-search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="map-filters">
          <button
            className={`map-filter-btn${filter === "borrow" ? " map-filter-borrow-active" : ""}`}
            onClick={() => setFilter(filter === "borrow" ? "all" : "borrow")}
          >Borrow</button>
          <button
            className={`map-filter-btn${filter === "service" ? " map-filter-service-active" : ""}`}
            onClick={() => setFilter(filter === "service" ? "all" : "service")}
          >Service</button>
          <div className="view-toggle">
            <button className="view-toggle-btn" onClick={() => navigate("/list")} aria-label="List view">
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
            <button className="view-toggle-btn view-toggle-active" aria-label="Map view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="7" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 21 Q12 21 7 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 21 Q12 21 17 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="10" r="2.5" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Listing detail overlay */}
        {selectedListing && (
          <div
            style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              background: "rgba(0,0,0,0.5)", zIndex: 2000,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
            onClick={() => setSelectedListing(null)}
          >
            <div
              style={{
                background: "white", borderRadius: "16px", overflow: "hidden",
                width: "520px", maxWidth: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
                maxHeight: "80vh", overflowY: "auto", border: "2px solid #4A1A0A"
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: "16px 24px 8px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0B1F44", margin: 0, flex: 1, paddingRight: "12px" }}>
                    {selectedListing.title}
                  </h2>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                    <button
                      onClick={() => setSaved(!saved)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                      title="Save listing"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? "#0B1F44" : "none"} stroke="#0B1F44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedListing(null)}
                      style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280", padding: "4px" }}
                    >✕</button>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{
                    fontSize: "13px", color: "white",
                    background: selectedListing.type === "service" ? "#4A1A0A" : "#D4703A",
                    padding: "3px 12px", borderRadius: "999px"
                  }}>
                    {selectedListing.type === "service" ? "Service" : "Borrow"}
                  </span>
                  {userLocation && selectedListing.location && (
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>
                      📍 {getDistance(userLocation.lat, userLocation.lng, selectedListing.location.lat, selectedListing.location.lng)} mi away
                    </span>
                  )}
                </div>
              </div>
              {selectedListing.image && (
                <div style={{ padding: "0 16px" }}>
                  <img
                    src={selectedListing.image}
                    alt={selectedListing.title}
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px" }}
                  />
                </div>
              )}
              <div style={{ padding: "16px 24px 24px 24px" }}>
                <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.6", marginBottom: "16px" }}>
                  {selectedListing.description}
                </p>
                {selectedListing.availability && (
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                    🕐 <strong>Availability:</strong> {selectedListing.availability}
                  </p>
                )}
                {selectedListing.company && (
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                    🏢 <strong>Company:</strong> {selectedListing.company}
                  </p>
                )}
                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "16px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: "#0B1F44", display: "flex", alignItems: "center",
                      justifyContent: "center", color: "white", fontSize: "14px", fontWeight: "600"
                    }}>
                      {selectedListing.createdBy ? selectedListing.createdBy.toString().slice(0,2).toUpperCase() : "?"}
                    </div>
                    <span style={{ fontSize: "14px", color: "#374151" }}>
                      Posted by <strong>{selectedListing.createdBy || "Anonymous"}</strong>
                    </span>
                  </div>
                  <button style={{
                    background: "#0B1F44", color: "white", border: "none",
                    padding: "10px 20px", borderRadius: "999px", fontSize: "14px", cursor: "pointer"
                  }}>
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}