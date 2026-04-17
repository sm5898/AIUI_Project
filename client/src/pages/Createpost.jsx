
import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { useSearch } from "../context/SearchContext";
import "../styles/createpost.css";

const BORROW_COLOR = "#D4703A";
const SERVICE_COLOR = "#4A1A0A";

export default function CreatePost() {
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
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const { fetchListings } = useSearch();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("ready");
      },
      () => setLocationStatus("denied")
    );
  }, []);

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;
    setImages((prev) => [...prev, file]);
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
    setSubmitError("");
    if (!location) {
      setSubmitError("Location is required. Please allow location access and try again.");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setSubmitError("You must be logged in to create a listing.");
      return;
    }
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("type", postType);
    form.append("company", company);
    form.append("availability", availabilityText);
    form.append("location", JSON.stringify(location));
    form.append("createdBy", `${user.firstName} ${user.lastName}`.trim());
    form.append("createdById", user.id || user._id);
    if (images[0]) form.append("image", images[0]);
    await api.post("/listings", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchListings();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate("/list");
    }, 2000);
  };

  return (
    <div className="cp-page">
      <Navbar active="post" />
      {showToast && (
        <div className="cp-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Listing created successfully!
        </div>
      )}

      <div className="cp-body">
        <h1 className="cp-heading">Create Post</h1>

        <div className="cp-layout">
          {/* ── FORM ── */}
          <div className="cp-form">

            {/* Post Type toggle */}
            <div className="cp-type-row">
              <span className="cp-type-label">Post Type:</span>
              <div className="cp-type-toggle">
                <button
                  className={`cp-type-btn${postType === "lend" ? " cp-type-active" : ""}`}
                  onClick={() => setPostType("lend")}
                >Lend</button>
                <button
                  className={`cp-type-btn${postType === "service" ? " cp-type-active" : ""}`}
                  onClick={() => setPostType("service")}
                >Service</button>
              </div>
            </div>

            {/* Title */}
            <label className="cp-label">Title:</label>
            <input
              className="cp-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Description | Availability */}
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
                        className="cp-cal-clear"
                        onClick={() => { setDateRange([null, null]); setShowCal(false); }}
                      >Clear</button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Product Company */}
            <label className="cp-label">
              Product Company:
              <span className="cp-optional"> Optional</span>
            </label>
            <input
              className="cp-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            {/* Upload Pictures */}
            <label className="cp-label">Upload Pictures:</label>
            <div className="cp-chips">
              {images.map((f) => (
                <div key={f.name} className="cp-chip">
                  <button className="cp-chip-remove" onClick={() => removeImage(f.name)}>✕</button>
                  <span>{f.name}</span>
                </div>
              ))}
            </div>
            <div
              className="cp-upload-box"
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
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
            {locationStatus === "denied" && (
              <p className="cp-error">Location access denied. Please enable it in your browser and refresh.</p>
            )}
            {locationStatus === "unavailable" && (
              <p className="cp-error">Geolocation is not supported by your browser.</p>
            )}
            <button className="cp-submit" onClick={submit} disabled={locationStatus !== "ready"}>Create Listing</button>
          </div>

          {/* ── LIVE PREVIEW ── */}
          <div className="cp-preview-section">
            <h2 className="cp-preview-heading">Preview of Listing</h2>
            <div className="cp-card" style={{ borderColor }}>
              <div className="cp-card-type">{postType === "lend" ? "Borrow" : "Service"}</div>
              <div className="cp-card-top">
                <h2 className="cp-card-title">{title || <span className="cp-card-empty">—</span>}</h2>
                <span className="cp-card-dist">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  (Distance will show here)
                </span>
              </div>
              {imagePreviewUrl && (
                <img className="cp-card-img" src={imagePreviewUrl} alt="preview" />
              )}
              {description && <p className="cp-card-desc">{description}</p>}
              {company && <p className="cp-card-meta"><strong>Company:</strong> {company}</p>}
              <p className="cp-card-meta"><strong>Availability:</strong> {availabilityText}</p>
              <hr className="cp-card-divider" />
              <p className="cp-card-posted">Posted by [You]</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}