import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ListingCard from "../components/Listingcard";
import api from "../api/api";
import "../styles/global.css";

export default function SavedListings() {
  const [savedListings, setSavedListings] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchSavedListings = async () => {
    try {
      if (!user?.id) return;

      const response = await api.get(`/saved/${user.id}`);
      setSavedListings(response.data);
    } catch (err) {
      console.error("Error fetching saved listings:", err);
      setError("Could not load saved listings.");
    }
  };

  useEffect(() => {
    fetchSavedListings();
  }, []);

  const handleUnsave = async (listingId) => {
    try {
      await api.delete(`/saved/${user.id}/${listingId}`);

      // Remove it from UI immediately
      setSavedListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );

      setMessage("Removed from saved");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error("Error removing saved listing:", err);
      setMessage("Failed to remove listing");
    }
  };

  return (
    <div className="page-root">
      <Navbar active="saved" />

      <div className="page-content">
        <h1 className="page-title">Saved Listings</h1>
        <p className="page-subtitle">Listings you’ve saved</p>

        {error && <p className="page-error">{error}</p>}
        {message && <p className="page-message">{message}</p>}

        {savedListings.length === 0 ? (
          <p>No saved listings yet.</p>
        ) : (
          <div className="listings-grid">
            {savedListings.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                isSaved={true}
                onToggleSave={handleUnsave}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}