import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { useEffect, useState } from "react"
import api from "../api/api"
import Navbar from "../components/Navbar"
import "leaflet/dist/leaflet.css"
import "../styles/exploremap.css"

export default function ExploreMap() {
  const [listings, setListings] = useState([])
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    api.get("/listings")
      .then(res => setListings(res.data))
  }, [])

  const filtered = listings.filter(item =>
    item.title?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <Navbar active="explore" />
      <div className="map-wrapper">
        <div className="search-container">
          <button
            className="search-icon-btn"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            🔍
          </button>
          {searchOpen && (
            <input
              className="search-input"
              type="text"
              placeholder="Search your neighborhood..."
              value={query}
              autoFocus
              onChange={e => setQuery(e.target.value)}
            />
          )}
        </div>

        <MapContainer
          center={[40.72, -73.98]}
          zoom={55}
          className="map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map(item => (
            <Marker
              key={item._id}
              position={[item.location.lat, item.location.lng]}
            >
              <Popup>{item.title}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}