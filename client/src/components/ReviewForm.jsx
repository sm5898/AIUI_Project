import React, { useState } from "react";
import api from "../api/api";
import "../styles/modal.css";

export default function ReviewForm({ listingId, revieweeId, onSubmit, onCancel }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/reviews", {
        reviewee: revieweeId,
        listing: listingId,
        rating,
        comment,
      });
      setLoading(false);
      if (onSubmit) onSubmit();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review.");
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Leave a Review</h3>
      <label>
        Rating:
        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
          {[5,4,3,2,1].map(n => (
            <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>
          ))}
        </select>
      </label>
      <label>
        Comment:
        <textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={1000} />
      </label>
      {error && <div className="review-error">{error}</div>}
      <div className="review-actions">
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Review"}</button>
        <button type="button" onClick={onCancel} disabled={loading}>Cancel</button>
      </div>
    </form>
  );
}
