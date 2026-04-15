import React from "react";
import "../styles/cards.css";

const BORROW_COLOR = "#D4703A";
const SERVICE_COLOR = "#4A1A0A";

export default function ListingCard({ listing }) {
  const isBorrow = listing.type === "lend" || listing.type === "borrow";
  const borderColor = isBorrow ? BORROW_COLOR : SERVICE_COLOR;
  const typeLabel = isBorrow ? "Borrow" : "Service";

  return (
    <div className="card" style={{ borderColor }}>
      <div className="card-type">{typeLabel}</div>
      <div className="card-top">
        <h2 className="card-title">{listing.title}</h2>
        <span className="card-dist">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {listing.distance || "(Distance will show here)"}
        </span>
      </div>
      {listing.image && (
        <img className="card-img" src={listing.image} alt={listing.title} />
      )}
      {listing.description && (
        <p className="card-desc">{listing.description}</p>
      )}
      {listing.company && (
        <p className="card-meta"><strong>Company:</strong> {listing.company}</p>
      )}
      {listing.availability && (
        <p className="card-meta"><strong>Availability:</strong> {listing.availability}</p>
      )}
      <hr className="card-divider" />
      <p className="card-posted">Posted by {listing.postedBy || "a neighbor"}</p>
    </div>
  );
}