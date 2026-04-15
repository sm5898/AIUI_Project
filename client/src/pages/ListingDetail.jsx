import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/api"
import Navbar from "../components/Navbar"

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => setListing(res.data))
      .catch(() => navigate("/explore"))
  }, [id])

  if (!listing) return <div style={{ padding: "40px" }}>Loading...</div>

  return (
    <div>
      <Navbar active="explore" />
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px" }}>
        <button
          onClick={() => navigate("/explore")}
          style={{ background: "none", border: "none", color: "#D4703A", cursor: "pointer", fontSize: "14px", marginBottom: "20px", padding: 0 }}
        >
          ← Back to map
        </button>

        <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          {listing.image && (
            <img
              src={listing.image}
              alt={listing.title}
              style={{ width: "100%", height: "240px", objectFit: "cover" }}
            />
          )}
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", color: "white", background: listing.type === "service" ? "#4A1A0A" : "#D4703A", padding: "4px 12px", borderRadius: "999px" }}>
                {listing.type === "service" ? "Service" : "Borrow"}
              </span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0B1F44", margin: "0 0 12px 0" }}>
              {listing.title}
            </h1>
            <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.6", marginBottom: "16px" }}>
              {listing.description}
            </p>
            {listing.availability && (
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                🕐 <strong>Availability:</strong> {listing.availability}
              </p>
            )}
            {listing.company && (
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                🏢 <strong>Company:</strong> {listing.company}
              </p>
            )}
            <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "16px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#0B1F44", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px", fontWeight: "600" }}>
                  {listing.createdBy ? listing.createdBy.toString().slice(0,2).toUpperCase() : "?"}
                </div>
                <span style={{ fontSize: "14px", color: "#374151" }}>
                  Posted by <strong>{listing.createdBy || "Anonymous"}</strong>
                </span>
              </div>
              <button style={{ background: "#0B1F44", color: "white", border: "none", padding: "10px 20px", borderRadius: "999px", fontSize: "14px", cursor: "pointer" }}>
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}