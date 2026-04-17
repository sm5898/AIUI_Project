import React, { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from "react-leaflet"
import { useNavigate } from "react-router-dom"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import Navbar from "../components/Navbar"
import ListingModal from "../components/ListingModal"
import { useSearch } from "../context/SearchContext"
import "../styles/map.css"

const SERVICE_COLOR = "#4A1A0A"
const BORROW_COLOR = "#D4703A"

function createPinIcon(color, title) {
  return L.divIcon({
    className: "",
    html: `
      <div class="map-pin">
        <svg width="32" height="40" viewBox="0 0 22 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 17 11 17S22 18.667 22 11C22 4.925 17.075 0 11 0z" fill="${color}"/>
          <circle cx="11" cy="10" r="4" fill="white" fill-opacity="0.65"/>
        </svg>
        <div class="map-pin-label" style="background:${color}">${title}</div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [16, 40],
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
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([40.724, -73.984])
  const [selectedListing, setSelectedListing] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hovered, setHovered] = useState(null)
  const [distanceFilter, setDistanceFilter] = useState(5)
  const searchRef = useRef(null)
  const hoverTimeout = useRef(null)
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

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const clearHover = () => {
    hoverTimeout.current = setTimeout(() => setHovered(null), 150)
  }
  const cancelClearHover = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
  }

  function handleSearchChange(e) {
    const val = e.target.value
    setQuery(val)
    if (val.length > 0) {
      const seen = new Set()
      const matches = filtered.filter(item => {
        if (!item.title?.toLowerCase().includes(val.toLowerCase())) return false
        if (seen.has(item.title)) return false
        seen.add(item.title)
        return true
      })
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

  const mapListings = filtered.filter(item => {
    if (!item.location?.lat || !item.location?.lng) return false
    
    if (distanceFilter && userLocation) {
      const distance = parseFloat(getDistance(
        userLocation.lat,
        userLocation.lng,
        item.location.lat,
        item.location.lng
      ))
      return distance <= distanceFilter
    }
    return true
  })

  return (
    <div className="map-page">
      <Navbar
  active="explore"
  showSearch={true}
  searchProps={{
    query,
    filter,
    suggestions,
    showSuggestions,
    searchRef,
    handleSearchChange,
    handleSuggestionClick,
    setFilter,
    distanceFilter,
    setDistanceFilter,
    handleClear: () => { setFilter("all"); setQuery(""); setDistanceFilter(null) }
  }}
/>
      <div className="map-wrapper">
        <MapContainer
  center={mapCenter}
  zoom={17}
  className="map-container"
  zoomControl={false}
  style={{ zIndex: 1 }}
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
              eventHandlers={{
                mouseover: (e) => {
                  cancelClearHover()
                  const el = e.originalEvent.target.closest(".leaflet-marker-icon")
                  if (el) {
                    const rect = el.getBoundingClientRect()
                    const wrapperRect = document.querySelector(".map-wrapper").getBoundingClientRect()
                    setHovered({
                      item,
                      x: rect.left - wrapperRect.left + rect.width / 2,
                      y: rect.top - wrapperRect.top + 70,
                    })
                  }
                },
                mouseout: () => clearHover(),
                click: () => { setHovered(null); setSelectedListing(item) }
              }}
            />
          ))}
        </MapContainer>

        {/* Hover card */}
        {hovered && (
          <div
            className="map-hover-card"
            style={{ left: hovered.x, top: hovered.y }}
            onMouseEnter={cancelClearHover}
            onMouseLeave={() => setHovered(null)}
            onClick={() => { setHovered(null); setSelectedListing(hovered.item) }}
          >
            <div
              className="map-hover-header"
              style={{ background: hovered.item.type?.toLowerCase() === "service" ? SERVICE_COLOR : BORROW_COLOR }}
            >
              {hovered.item.title}
            </div>
            <div className="map-hover-body">
              <div className="map-hover-meta">
                <div className="map-hover-avatar">
                  {(hovered.item.createdBy || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="map-hover-posted">Posted by:</div>
                  <div className="map-hover-name">{hovered.item.createdBy || "A neighbor"}</div>
                </div>
                {userLocation && hovered.item.location && (
                  <div className="map-hover-dist">
                    {getDistance(userLocation.lat, userLocation.lng, hovered.item.location.lat, hovered.item.location.lng)} mi
                  </div>
                )}
              </div>
              {hovered.item.description && (
                <p className="map-hover-desc">{hovered.item.description}</p>
              )}
              <hr className="map-hover-divider" />
              <p className="map-hover-cta">Click to view more details</p>
            </div>
          </div>
        )}

        
        
{/* Bottom nav pill */}
        <div style={{
          position: "absolute", bottom: "30px", left: "50%",
          transform: "translateX(-50%)", zIndex: 1000,
          background: "#0B1F44", borderRadius: "999px",
          padding: "12px 40px", display: "flex", gap: "40px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
        }}>
          <span style={{ color: "white", opacity: 1, fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>Explore</span>
          <span style={{ color: "white", opacity: 0.6, cursor: "pointer", fontSize: "14px" }} onClick={() => navigate("/messages")}>Messages</span>
          <span style={{ color: "white", opacity: 0.6, cursor: "pointer", fontSize: "14px" }} onClick={() => navigate("/create")}>Post</span>
        </div>

      </div>

    
      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          distance={userLocation && selectedListing.location ?
            getDistance(userLocation.lat, userLocation.lng, selectedListing.location.lat, selectedListing.location.lng) + " mi away"
            : null}
        />
      )}
    </div>
  )
}