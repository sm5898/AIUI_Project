import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useSearch } from "../context/SearchContext";
import "../styles/modal.css";

const BORROW_COLOR = "#D4703A";
const SERVICE_COLOR = "#4A1A0A";

export default function ListingModal({ listing, onClose }) {
  const navigate = useNavigate();
  const { fetchListings } = useSearch();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const isBorrow = listing.type === "lend" || listing.type === "borrow";
  const accentColor = isBorrow ? BORROW_COLOR : SERVICE_COLOR;
  const typeLabel = isBorrow ? "Borrow" : "Service";
  const postedBy = listing.createdBy || listing.postedBy || "A neighbor";

  const isOwner =
    user?.id &&
    (listing.createdById === user.id || listing.createdBy === user.firstName);

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        if (!user?.id) return;

        const response = await api.get(`/saved/${user.id}`);
        const alreadySaved = response.data.some(
          (saved) => saved._id === listing._id
        );
        setIsSaved(alreadySaved);
      } catch (err) {
        console.error("Error checking saved listings:", err);
      }
    };

    checkIfSaved();
  }, [user?.id, listing._id]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSaveToggle = async () => {
    try {
      if (!user?.id) {
        setSaveMessage("Please log in to save listings.");
        return;
      }

      if (isSaved) {
        await api.delete(`/saved/${user.id}/${listing._id}`);
        setIsSaved(false);
        setSaveMessage("Removed from saved.");
      } else {
        await api.post(`/saved/${user.id}/${listing._id}`);
        setIsSaved(true);
        setSaveMessage("Saved successfully.");
      }

      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err) {
      console.error("Error saving listing:", err);
      setSaveMessage("Could not update saved listings.");
    }
  };

  const handleMessageClick = () => {
    if (!user?.id) {
      setSaveMessage("Please log in to send messages.");
      setTimeout(() => setSaveMessage(""), 2000);
      return;
    }

    if (!listing.createdById) {
      setSaveMessage("This listing cannot be messaged yet.");
      setTimeout(() => setSaveMessage(""), 2000);
      return;
    }

    if (listing.createdById === user.id) {
      setSaveMessage("You can't message yourself.");
      setTimeout(() => setSaveMessage(""), 2000);
      return;
    }

    navigate("/messages", {
      state: {
        recipientId: listing.createdById,
        listingId: listing._id,
      },
    });
  };

  const handleDelete = async () => {
    try {
      const confirmed = window.confirm("Delete this listing?");
      if (!confirmed) return;

      await api.delete(`/listings/${listing._id}`);
      await fetchListings();
      onClose();
    } catch (err) {
      console.error("Error deleting listing:", err);
      setSaveMessage("Could not delete listing.");
      setTimeout(() => setSaveMessage(""), 2000);
    }
  };

  const handleEdit = () => {
    onClose();
    navigate(`/edit/${listing._id}`);
  };

  return (
    <div className="lm-backdrop" onClick={onClose}>
      <div
        className="lm-card"
        style={{ borderColor: accentColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lm-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="lm-type-row">
          <span className="lm-type-label">{typeLabel}</span>
        </div>

        <div className="lm-title-row">
          <h2 className="lm-title">{listing.title}</h2>
          {listing.distance && (
            <span className="lm-dist">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {listing.distance}
            </span>
          )}
        </div>

       {listing.image && (
        <img
          className="lm-img"
          src={
            listing.image.startsWith("http")
              ? listing.image
              : `http://localhost:5001${listing.image}`
          }
          alt={listing.title}
          onError={(e) => {
            e.target.style.display = "none";
          }}
          />
        )}

        {listing.description && (
          <p className="lm-desc">{listing.description}</p>
        )}

        {listing.company && (
          <p className="lm-meta">
            <strong>Company:</strong> {listing.company}
          </p>
        )}

        {listing.availability && (
          <p className="lm-meta">
            <strong>Availability:</strong> {listing.availability}
          </p>
        )}

        <hr className="lm-divider" />

        <div className="lm-footer">
          <div className="lm-avatar" style={{ background: accentColor }}>
            {postedBy?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="lm-posted">
            Posted by <strong>{postedBy}</strong>
          </span>
          <button className="lm-msg-btn" onClick={handleMessageClick}>
            Message {postedBy}
          </button>
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="lm-msg-btn" onClick={handleSaveToggle}>
            {isSaved ? "❤️ Unsave" : "🤍 Save"}
          </button>

          <button className="lm-msg-btn" onClick={() => navigate("/profile/saved")}> 
            View Saved
          </button>

          {isOwner && (
            <>
              <button className="lm-msg-btn" onClick={handleEdit}>
                ✏️ Edit
              </button>

              <button className="lm-msg-btn" onClick={handleDelete}>
                🗑 Delete
              </button>
            </>
          )}
        </div>

        {saveMessage && (
          <p style={{ marginTop: "12px", fontWeight: 600 }}>{saveMessage}</p>
        )}
      </div>
    </div>
  );
}