import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { useSearch } from "../context/SearchContext";
import "../styles/createpost.css";

const BORROW_COLOR = "#D4703A";
const SERVICE_COLOR = "#4A1A0A";

function createSelectedLocationIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div class="map-pin">
        <svg width="32" height="40" viewBox="0 0 22 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 17 11 17S22 18.667 22 11C22 4.925 17.075 0 11 0z" fill="#0B1F44"/>
          <circle cx="11" cy="10" r="4" fill="white" fill-opacity="0.85"/>
        </svg>
        <div class="map-pin-label" style="background:#0B1F44">Location</div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [16, 40],
  });
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function CreatePost() {
  const { fetchListings } = useSearch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [postType, setPostType] = useState("lend");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [showCal, setShowCal] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("detecting");
  const [submitError, setSubmitError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (isEditMode) return;

    if (!navigator.geolocation) {
      setLocation({ lat: 40.7265, lng: -73.9815 });
      setLocationStatus("ready");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("ready");
      },
      () => {
        setLocation({ lat: 40.7265, lng: -73.9815 });
        setLocationStatus("ready");
      }
    );
  }, [isEditMode]);

  useEffect(() => {
    const fetchListingForEdit = async () => {
      try {
        if (!isEditMode) return;

        const response = await api.get(`/listings/${id}`);
        const listing = response.data;

        setTitle(listing.title || "");
        setDescription(listing.description || "");
        setPostType(listing.type || "lend");
        setCompany(listing.company || "");
        setImagePreviewUrl(listing.image || null);
        setLocation(listing.location || null);
        setLocationStatus("ready");
      } catch (err) {
        console.error("Error loading listing for edit:", err);
        setSubmitError("Could not load listing for editing.");
      }
    };

    fetchListingForEdit();
  }, [id, isEditMode]);

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;
    setImages((prev) => [file]);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = (name) => {
    const remaining = images.filter((f) => f.name !== name);
    setImages(remaining);
    if (remaining.length === 0) setImagePreviewUrl(null);
  };

  const availabilityText = startDate
    ? endDate
      ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
      : startDate.toLocaleDateString()
    : "Available Anytime";

  const borderColor = postType === "lend" ? BORROW_COLOR : SERVICE_COLOR;

  const submit = async () => {
    try {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setSubmitError("");
      setShowSuccess(false);

      if (!location) {
        setSubmitError("Location is required.");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setSubmitError("You must be logged in.");
        return;
      }

      if (isEditMode) {
        const payload = {
          title,
          description,
          type: postType,
          company,
          image: imagePreviewUrl || "",
          availability: availabilityText,
          location,
          createdBy: user.firstName,
          createdById: user.id,
        };

        await api.put(`/listings/${id}`, payload);
      } else {
        const formData = new FormData();

        formData.append("title", title);
        formData.append("description", description);
        formData.append("type", postType);
        formData.append("company", company);
        formData.append("availability", availabilityText);
        formData.append("location", JSON.stringify(location));
        formData.append("createdBy", user.firstName);
        formData.append("createdById", user.id);

        if (images[0]) {
          formData.append("image", images[0]);
        }

        await api.post("/listings", formData);
      }

      await fetchListings();

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);

      if (isEditMode) {
        navigate("/explore");
        return;
      }

      setTitle("");
      setDescription("");
      setCompany("");
      setImages([]);
      setImagePreviewUrl(null);
      setDateRange([null, null]);
      setShowCal(false);
    } catch (error) {
      console.error("Error saving listing:", error);
      setSubmitError(
        error?.response?.data?.message || error.message || "Failed to save listing."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cp-page">
      <Navbar active="post" />

      {showSuccess && (
        <div className="cp-success-popup">
          {isEditMode ? "Listing updated successfully!" : "Listing created successfully!"}
        </div>
      )}

      <div className="cp-body">
        <h1 className="cp-heading">{isEditMode ? "Edit Post" : "Create Post"}</h1>

        <div className="cp-layout">
          <div className="cp-form">
            <div className="cp-type-row">
              <span className="cp-type-label">Post Type:</span>
              <div className="cp-type-toggle">
                <button
                  type="button"
                  className={`cp-type-btn${postType === "lend" ? " cp-type-active" : ""}`}
                  onClick={() => setPostType("lend")}
                >
                  Lend
                </button>
                <button
                  type="button"
                  className={`cp-type-btn${postType === "service" ? " cp-type-active" : ""}`}
                  onClick={() => setPostType("service")}
                >
                  Service
                </button>
              </div>
            </div>

            <label className="cp-label">Title:</label>
            <input
              className="cp-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="cp-label">Description | Availability</label>
            <div className="cp-desc-wrap">
              <textarea
                className="cp-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="cp-desc-divider" />
              <div className="cp-cal-wrap">
                <button
                  type="button"
                  className="cp-cal-btn"
                  onClick={() => setShowCal((v) => !v)}
                  title="Pick availability dates"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B1F44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>

                {showCal && (
                  <div className="cp-cal-popup">
                    <DatePicker
                      selected={startDate}
                      onChange={(dates) => {
                        setDateRange(dates);
                        if (dates[0] && dates[1]) setShowCal(false);
                      }}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange
                      inline
                    />
                    {(startDate || endDate) && (
                      <button
                        type="button"
                        className="cp-cal-clear"
                        onClick={() => {
                          setDateRange([null, null]);
                          setShowCal(false);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <label className="cp-label">
              Product Company:
              <span className="cp-optional"> Optional</span>
            </label>
            <input
              className="cp-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <label className="cp-label">Choose Location on Map:</label>
            <div
              style={{
                height: "260px",
                borderRadius: "20px",
                overflow: "hidden",
                marginBottom: "16px",
                border: "1px solid #E5E7EB",
              }}
            >
              <MapContainer
                center={
                  location
                    ? [location.lat, location.lng]
                    : [40.7265, -73.9815]
                }
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <MapClickHandler onSelect={(coords) => {
                  setLocation(coords);
                  setLocationStatus("ready");
                }} />

                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
                  subdomains="abcd"
                  maxZoom={19}
                />

                {location && (
                  <Marker
                    position={[location.lat, location.lng]}
                    icon={createSelectedLocationIcon()}
                  />
                )}
              </MapContainer>
            </div>

            <label className="cp-label">Upload Pictures:</label>
            <div className="cp-chips">
              {images.map((f) => (
                <div key={f.name} className="cp-chip">
                  <button
                    type="button"
                    className="cp-chip-remove"
                    onClick={() => removeImage(f.name)}
                  >
                    ✕
                  </button>
                  <span>{f.name}</span>
                </div>
              ))}
            </div>

            <div
              className="cp-upload-box"
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
              <p className="cp-upload-text">Click or drag file to this area to upload</p>
              <p className="cp-upload-hint">Formats accepted are .png, .jpeg, .mp4 and .mov</p>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".png,.jpeg,.jpg,.mp4,.mov"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {submitError && <p className="cp-error">{submitError}</p>}
            {locationStatus === "detecting" && (
              <p className="cp-location-status">Detecting your location...</p>
            )}
            {location && (
              <p className="cp-location-status">
                Location set: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}

            <button
              type="button"
              className="cp-submit"
              onClick={submit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Listing"
                : "Create Listing"}
            </button>
          </div>

          <div className="cp-preview-section">
            <h2 className="cp-preview-heading">Preview of Listing</h2>
            <div className="cp-card" style={{ borderColor }}>
              <div className="cp-card-type">{postType === "lend" ? "Borrow" : "Service"}</div>
              <div className="cp-card-top">
                <h2 className="cp-card-title">
                  {title || <span className="cp-card-empty">—</span>}
                </h2>
                <span className="cp-card-dist">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  (Distance will show here)
                </span>
              </div>

              {imagePreviewUrl && (
                <img
                  className="cp-card-img"
                  src={
                    imagePreviewUrl.startsWith("blob:")
                      ? imagePreviewUrl
                      : `http://localhost:5001${imagePreviewUrl}`
                  }
                  alt="preview"
                />
              )}

              {description && <p className="cp-card-desc">{description}</p>}
              {company && <p className="cp-card-meta"><strong>Company:</strong> {company}</p>}
              <p className="cp-card-meta"><strong>Availability:</strong> {availabilityText}</p>
              <hr className="cp-card-divider" />
              <p className="cp-card-posted">
                Posted by {JSON.parse(localStorage.getItem("user"))?.firstName || "You"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}