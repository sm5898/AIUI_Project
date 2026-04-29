import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function ReviewList({ listingId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/reviews/listing/${listingId}`);
        setReviews(res.data);
      } catch {
        setReviews([]);
      }
      setLoading(false);
    };
    fetchReviews();
  }, [listingId]);

  if (loading) return <div style={{marginTop:8, color:'#888'}}>Loading reviews...</div>;
  if (!reviews.length) return <div style={{marginTop:8, color:'#888'}}>No reviews yet.</div>;

  return (
    <div className="review-list">
      <h4 style={{margin:'8px 0 8px', fontWeight:700, color:'#0B1F44'}}>Check Reviews</h4>
      {reviews.map((r) => (
        <div key={r._id} className="review-list-item">
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontWeight:700, color:'#4A1A0A'}}>{r.rating}★</span>
            <span style={{fontWeight:600}}>{r.reviewer?.name || 'User'}</span>
            <span style={{fontSize:12, color:'#888'}}>{new Date(r.createdAt).toLocaleDateString()}</span>
          </div>
          <div style={{fontSize:14, color:'#333', marginTop:2}}>{r.comment}</div>
        </div>
      ))}
    </div>
  );
}
