import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import ListingModal from "../components/ListingModal";
import { useSearch } from "../context/SearchContext";
import "../styles/map.css";

const SERVICE_COLOR = "#4A1A0A";
const BORROW_COLOR = "#D4703A";

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
  });
}

export default function ExploreMap() {
  const { filtered, query, setQuery, filter, setFilter } = useSearch();
  const [searchOpen, setSearchOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const hoverTimeout = useRef(null);
  const navigate = useNavigate();

  const clearHover = () => {
    hoverTimeout.current = setTimeout(() => setHovered(null), 150);
  };

  const cancelClearHover = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  const mapListings = filtered.filter(
    (item) => item.location?.lat && item.location?.lng
  );

  return (
    <div className="map-page">
      <Navbar active="explore" />

      <div className="map-wrapper">
        <MapContainer
          center={[40.724, -73.984]}
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

          <ZoomControl position="bottomleft" />

          {mapListings.map((item) => (
            <Marker
              key={item._id}
              position={[item.location.lat, item.location.lng]}
              icon={createPinIcon(
                item.type?.toLowerCase() === "service" ? SERVICE_COLOR : BORROW_COLOR,
                item.title
              )}
              eventHandlers={{
                mouseover: (e) => {
                  cancelClearHover();
                  const el = e.originalEvent.target.closest(".leaflet-marker-icon");
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    const wrapperRect =
                      document.querySelector(".map-wrapper").getBoundingClientRect();

                    setHovered({
                      item,
                      x: rect.left - wrapperRect.left + rect.width / 2,
                      y: rect.top - wrapperRect.top + 70,
                    });
                  }
                },
                mouseout: () => clearHover(),
                click: () => {
                  setHovered(null);
                  setSelectedListing(item);
                },
              }}
            />
          ))}
        </MapContainer>

        {hovered && (
          <div
            className="map-hover-card"
            style={{ left: hovered.x, top: hovered.y }}
            onMouseEnter={cancelClearHover}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              setHovered(null);
              setSelectedListing(hovered.item);
            }}
          >
            <div
              className="map-hover-header"
              style={{
                background:
                  hovered.item.type?.toLowerCase() === "service"
                    ? SERVICE_COLOR
                    : BORROW_COLOR,
              }}
            >
              {hovered.item.title}
            </div>
            <div className="map-hover-body">
              <div className="map-hover-meta">
                <div className="map-hover-avatar">
                  {hovered.item.createdBy?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="map-hover-posted">Posted by:</div>
                  <div className="map-hover-name">
                    {hovered.item.createdBy || "A neighbor"}
                  </div>
                </div>
                {hovered.item.distance && (
                  <div className="map-hover-dist">{hovered.item.distance}</div>
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

        <div className="map-search-overlay">
          {searchOpen ? (
            <input
              autoFocus
              className="map-search-input"
              placeholder="Search listings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => {
                if (!query) setSearchOpen(false);
              }}
            />
          ) : (
            <button
              className="map-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
            </button>
          )}
        </div>

        <div className="map-filters">
          {(filter !== "all" || query) && (
            <button
              className="map-clear-filters-btn"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
            >
              × Clear
            </button>
          )}

          <button
            className={`map-filter-btn${filter === "borrow" ? " map-filter-borrow-active" : ""}`}
            onClick={() => setFilter(filter === "borrow" ? "all" : "borrow")}
          >
            Borrow
          </button>

          <button
            className={`map-filter-btn${filter === "service" ? " map-filter-service-active" : ""}`}
            onClick={() => setFilter(filter === "service" ? "all" : "service")}
          >
            Service
          </button>

          <div className="view-toggle">
            <button
              className="view-toggle-btn"
              onClick={() => navigate("/list")}
              aria-label="List view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="4" height="4" rx="0.5" fill="currentColor" />
                <rect x="9" y="3" width="4" height="4" rx="0.5" fill="currentColor" />
                <rect x="15" y="3" width="4" height="4" rx="0.5" fill="currentColor" />
                <rect x="3" y="9" width="4" height="4" rx="0.5" fill="currentColor" />
                <rect x="9" y="9" width="4" height="4" rx="0.5" fill="currentColor" />
                <rect x="15" y="9" width="4" height="4" rx="0.5" fill="currentColor" />
                <rect x="3" y="15" width="4" height="4" rx="0.5" fill="currentColor" />
                <rect x="9" y="15" width="4" height="4" rx="0.5" fill="currentColor" />
                <rect x="15" y="15" width="4" height="4" rx="0.5" fill="currentColor" />
              </svg>
            </button>

            <button className="view-toggle-btn view-toggle-active" aria-label="Map view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="10" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M12 21 Q12 21 7 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M12 21 Q12 21 17 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="10" r="2.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}