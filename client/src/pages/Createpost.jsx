import React, { useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { useSearch } from "../context/SearchContext";
import "../styles/forms.css";

export default function CreatePost() {
  const { fetchListings } = useSearch();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "service",
    image: "",
    availability: "",
    lat: "40.7265",
    lng: "-73.9815",
    createdBy: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);

      const savedUser = JSON.parse(localStorage.getItem("user"));

      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        image: form.image,
        availability: form.availability,
        location: {
          lat: Number(form.lat),
          lng: Number(form.lng),
        },
        createdBy: savedUser?.firstName || form.createdBy || "Anonymous",
      };

      const response = await api.post("/listings", payload);
      console.log("Listing created:", response.data);

      await fetchListings();

      alert("Listing created successfully!");

      setForm({
        title: "",
        description: "",
        type: "service",
        image: "",
        availability: "",
        lat: "40.7265",
        lng: "-73.9815",
        createdBy: "",
      });
    } catch (error) {
      console.error("Error creating listing:", error.response?.data || error.message);
      alert("Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar active="post" />

      <div className="form-grid">
        <div className="form-section">
          <h2>Create a Listing</h2>

          <label>Title</label>
          <input
            className="input"
            placeholder="e.g. Dog Walking"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <label>Description</label>
          <textarea
            className="input"
            placeholder="Describe the service or item"
            rows="4"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <label>Type</label>
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="service">Service</option>
            <option value="borrow">Borrow</option>
          </select>

          <label>Image URL</label>
          <input
            className="input"
            placeholder="Paste an image link"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <label>Availability</label>
          <input
            className="input"
            placeholder="e.g. Weekdays 5–7pm"
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
          />

          <label>Latitude</label>
          <input
            className="input"
            placeholder="40.7265"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
          />

          <label>Longitude</label>
          <input
            className="input"
            placeholder="-73.9815"
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
          />

          <label>Created By</label>
          <input
            className="input"
            placeholder="Your name"
            value={form.createdBy}
            onChange={(e) => setForm({ ...form, createdBy: e.target.value })}
          />

          <button className="signup-btn" onClick={submit} disabled={loading}>
            {loading ? "Creating..." : "Create Listing"}
          </button>
        </div>

        <div className="preview">
          <h2>Preview</h2>

          {form.image ? (
            <img
              src={form.image}
              alt={form.title || "Preview"}
              style={{
                width: "100%",
                maxHeight: "240px",
                objectFit: "cover",
                borderRadius: "20px",
                marginBottom: "16px",
              }}
            />
          ) : (
            <div className="upload-box" style={{ marginBottom: "16px" }}>
              No image yet
            </div>
          )}

          <p style={{ textTransform: "capitalize", color: "#6B7280" }}>{form.type}</p>
          <h3>{form.title || "Listing title"}</h3>
          <p>{form.description || "Your description will appear here."}</p>
          <p>
            <strong>Availability:</strong> {form.availability || "Not added yet"}
          </p>
          <p>
            <strong>Posted by:</strong>{" "}
            {JSON.parse(localStorage.getItem("user"))?.firstName || form.createdBy || "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}