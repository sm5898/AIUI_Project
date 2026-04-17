import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/api";
import "../styles/profile.css";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function PinIcon() {
  return (
    <svg width="12" height="15" viewBox="0 0 22 28" fill="none">
      <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 17 11 17S22 18.667 22 11C22 4.925 17.075 0 11 0z" fill="#D4703A"/>
      <circle cx="11" cy="10" r="4" fill="white" fillOpacity="0.6"/>
    </svg>
  );
}

function TypeTag({ type }) {
  const label = type === "borrow" ? "Borrow" : type === "lend" ? "Lend" : "Service";
  return <span className={`pf-tag pf-tag--${type}`}>{label}</span>;
}

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fileInputRef = useRef();

  const [profile, setProfile] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [stats, setStats] = useState({ listingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", bio: "", location: "", photo: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.user);
      setStats(res.data.stats);
      setMyListings(res.data.myListings);
    } catch {
      setError("Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    setEditForm({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      bio: profile.bio || "",
      location: profile.location || "",
      photo: profile.photo || "",
    });
    setEditError("");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setEditError("");
    try {
      const res = await api.put("/profile/me", editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.user);
      // Update localStorage user so navbar initials refresh
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...res.data.user }));
      setEditing(false);
    } catch {
      setEditError("Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditForm(f => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="pf-loading"><Navbar /><p>Loading…</p></div>;
  if (error) return <div className="pf-loading"><Navbar /><p>{error}</p></div>;

  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
  const joinedYear = new Date(profile.createdAt).getFullYear();
  const joinedAgo = timeAgo(profile.createdAt).replace("ago", "").trim();
  const joinedText = `Joined ${Math.round((Date.now() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24 * 365))} year${Math.round((Date.now() - new Date(profile.createdAt)) / (1000 * 60 * 60 * 24 * 365)) !== 1 ? "s" : ""} ago`;

  return (
    <div className="pf-root">
      <Navbar />

      <div className="pf-page">
        <h1 className="pf-page-title">My Profile</h1>

        <div className="pf-layout">

          {/* ── Left sidebar ── */}
          <aside className="pf-sidebar">
            {editing ? (
              /* Edit form */
              <div className="pf-edit-card">
                <h3 className="pf-edit-title">Edit Profile</h3>

                {/* Photo */}
                <div className="pf-edit-avatar-wrap">
                  {editForm.photo ? (
                    <img src={editForm.photo} alt="avatar" className="pf-edit-avatar-img" />
                  ) : (
                    <div className="pf-edit-avatar-initials">{initials}</div>
                  )}
                  <button className="pf-edit-avatar-btn" onClick={() => fileInputRef.current.click()}>
                    Change photo
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoFile} />
                </div>

                <label className="pf-edit-label">First Name</label>
                <input className="pf-edit-input" value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />

                <label className="pf-edit-label">Last Name</label>
                <input className="pf-edit-input" value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />

                <label className="pf-edit-label">Location</label>
                <input className="pf-edit-input" placeholder="e.g. East Village, NY" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />

                <label className="pf-edit-label">Bio</label>
                <textarea className="pf-edit-textarea" rows={3} placeholder="Tell your neighbors a bit about yourself…" value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} />

                {editError && <p className="pf-edit-error">{editError}</p>}

                <div className="pf-edit-actions">
                  <button className="pf-edit-cancel" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="pf-edit-save" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              /* View card */
              <div className="pf-sidebar-card">
                {/* Avatar */}
                <div className="pf-avatar-wrap">
                  {profile.photo ? (
                    <img src={profile.photo} alt="avatar" className="pf-avatar-img" />
                  ) : (
                    <div className="pf-avatar-initials">{initials}</div>
                  )}
                </div>

                <h2 className="pf-name">{profile.firstName} {profile.lastName}</h2>
                <p className="pf-handle">@{profile.firstName?.toLowerCase()}_{profile.lastName?.[0]?.toLowerCase()}</p>

                {profile.location && (
                  <p className="pf-location">
                    <PinIcon /> {profile.location}
                  </p>
                )}

                <div className="pf-divider" />

                {profile.bio && (
                  <>
                    <h4 className="pf-section-label">About Me</h4>
                    <p className="pf-bio">{profile.bio}</p>
                    <div className="pf-divider" />
                  </>
                )}

                <h4 className="pf-section-label">Your Stats</h4>
                <ul className="pf-stats">
                  <li><strong>{stats.listingCount}</strong> active listing{stats.listingCount !== 1 ? "s" : ""}</li>
                </ul>
                <p className="pf-joined">{joinedText}</p>

                <button className="pf-edit-btn" onClick={openEdit}>Edit Profile</button>
              </div>
            )}
          </aside>

          {/* ── Main content ── */}
          <main className="pf-main">

            {/* My Listings */}
            <section className="pf-section">
              <div className="pf-section-header">
                <h2 className="pf-section-title">My Listings</h2>
                <button className="pf-view-all" onClick={() => navigate("/create")}>+ New listing</button>
              </div>

              {myListings.length === 0 ? (
                <div className="pf-empty">
                  <p>You haven't posted anything yet.</p>
                  <button className="pf-empty-btn" onClick={() => navigate("/create")}>Post your first listing</button>
                </div>
              ) : (
                <div className="pf-listings-grid">
                  {myListings.map(listing => (
                    <div key={listing._id} className="pf-listing-card">
                      {listing.image ? (
                        <img src={listing.image} alt={listing.title} className="pf-listing-img" />
                      ) : (
                        <div className="pf-listing-img pf-listing-img--empty">
                          <PinIcon />
                        </div>
                      )}
                      <TypeTag type={listing.type} />
                      <div className="pf-listing-footer">
                        <span className="pf-listing-title">{listing.title}</span>
                        <span className="pf-listing-arrow">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Activity (derived from listing timestamps) */}
            <section className="pf-section">
              <h2 className="pf-section-title">Recent Activity</h2>
              <div className="pf-activity-card">
                {myListings.length === 0 ? (
                  <p className="pf-activity-empty">No activity yet.</p>
                ) : (
                  myListings.map((listing, i) => (
                    <div key={listing._id} className={`pf-activity-row${i < myListings.length - 1 ? " pf-activity-row--border" : ""}`}>
                      <div className="pf-activity-avatar">{initials}</div>
                      <p className="pf-activity-text">
                        <strong>You</strong> posted <strong>{listing.title}</strong>
                      </p>
                      <span className="pf-activity-time">{timeAgo(listing.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
