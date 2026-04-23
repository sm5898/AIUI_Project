import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import ListingModal from "../components/ListingModal";
import { useSearch } from "../context/SearchContext";
import "../styles/map.css";

const SERVICE_COLOR = "#4A1A0A";
const BORROW_COLOR = "#D4703A";

const TILES = [
  {
    id: "default",
    label: "Default",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains: "abcd",
  },
  {
    id: "warm",
    label: "Warm",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains: "abcd",
  },
  {
    id: "dark",
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains: "abcd",
  },
  {
    id: "minimal",
    label: "Minimal",
    url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    subdomains: "abcd",
  },
];

function createPinIcon(color, title, expanded) {
  const short = title.length > 22 ? title.slice(0, 21) + "\u2026" : title;
  if (!expanded) {
    return L.divIcon({
      className: "",
      html: `
        <div class="map-pin-dot-only" style="background:${color};">
          <div class="map-pin-dot-ring"></div>
        </div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }
  return L.divIcon({
    className: "",
    html: `
      <div class="map-pin">
        <div class="map-pin-bubble" style="background:${color}; --c:${color};">
          ${short}
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 34],
  });
}

function ZoomTracker({ onZoom }) {
  useMapEvents({
    zoomend: (e) => onZoom(e.target.getZoom()),
  });
  return null;
}

function AutoCenter({ center }) {
  const map = useMap();
  const centered = useRef(false);

  useEffect(() => {
    if (!centered.current && center[0] !== 40.724) {
      map.setView(center, 17, { animate: true });
      centered.current = true;
    }
  }, [center, map]);

  return null;
}

export default function ExploreMap() {
  const { filtered, query, setQuery, filter, setFilter, availabilityFilter, setAvailabilityFilter } = useSearch();
  const [searchOpen, setSearchOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [zoom, setZoom] = useState(17);
  const [tileIndex, setTileIndex] = useState(0);
  const [showTilePicker, setShowTilePicker] = useState(false);
  const hoverTimeout = useRef(null);
  const navigate = useNavigate();

  const activeTile = TILES[tileIndex];

  const clearHover = () => {
    hoverTimeout.current = setTimeout(() => setHovered(null), 150);
  };

  const cancelClearHover = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  const mapListings = filtered.filter(
    (item) => item.location?.lat && item.location?.lng
  );

  const mapCenter = mapListings.length > 0
    ? [
        mapListings.reduce((sum, i) => sum + i.location.lat, 0) / mapListings.length,
        mapListings.reduce((sum, i) => sum + i.location.lng, 0) / mapListings.length,
      ]
    : [40.724, -73.984];

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
            key={activeTile.id}
            url={activeTile.url}
            attribution={activeTile.attribution}
            subdomains={activeTile.subdomains}
            maxZoom={19}
          />

          <ZoomControl position="bottomleft" />

          <AutoCenter center={mapCenter} />
          <ZoomTracker onZoom={setZoom} />

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={40}
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();
              return L.divIcon({
                html: `<div class="map-cluster">${count}</div>`,
                className: "",
                iconSize: [36, 36],
                iconAnchor: [18, 18],
              });
            }}
          >
          {mapListings.map((item) => (
            <Marker
              key={item._id}
              position={[item.location.lat, item.location.lng]}
              icon={createPinIcon(
                item.type?.toLowerCase() === "service" ? SERVICE_COLOR : BORROW_COLOR,
                item.title,
                zoom >= 15
              )}
              eventHandlers={{
                mouseover: (e) => {
                  cancelClearHover();
                  const map = e.target._map;
                  const pt = map.latLngToContainerPoint(e.target.getLatLng());

                  setHovered({
                    item,
                    x: pt.x,
                    y: pt.y - 40,
                  });
                },
                mouseout: () => clearHover(),
                click: () => {
                  setHovered(null);
                  setSelectedListing(item);
                },
              }}
            />
          ))}
          </MarkerClusterGroup>
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
          {(filter !== "all" || query || availabilityFilter !== "all") && (
            <button
              className="map-clear-filters-btn"
              onClick={() => {
                setFilter("all");
                setQuery("");
                setAvailabilityFilter("all");
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

          <select
            className="map-availability-filter"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          >
            <option value="all">All Availability</option>
            <option value="now">Available Now</option>
            <option value="weekends">Weekends</option>
            <option value="weekdays">Weekdays</option>
            <option value="anytime">Anytime</option>
          </select>

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

        {/* Tile style picker */}
        <div className="map-tile-picker">
          <button
            className="map-tile-picker-btn"
            onClick={() => setShowTilePicker((v) => !v)}
            title="Map style"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </button>
          {showTilePicker && (
            <div className="map-tile-options">
              {TILES.map((t, i) => (
                <button
                  key={t.id}
                  className={`map-tile-option${tileIndex === i ? " map-tile-option-active" : ""}`}
                  onClick={() => { setTileIndex(i); setShowTilePicker(false); }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
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