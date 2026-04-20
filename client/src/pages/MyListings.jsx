import React from "react";
import Navbar from "../components/Navbar";
import { useSearch } from "../context/SearchContext";
import "../styles/global.css";

export default function MyListings() {
  const { listings } = useSearch();
  const user = JSON.parse(localStorage.getItem("user"));

  const myListings = listings.filter((item) => {
    if (!user) return false;

    const createdBy = (item.createdBy || "").trim().toLowerCase();
    const firstName = (user.firstName || "").trim().toLowerCase();

    return createdBy === firstName;
  });

  return (
    <div className="page-root">
      <Navbar active="my-listings" />

      <div className="page-content">
        <h1 className="page-title">My Listings</h1>

        <p>
          Logged in user: <strong>{user ? user.firstName : "None"}</strong>
        </p>

        <p>
          Total listings: <strong>{listings.length}</strong>
        </p>

        <p>
          My listings: <strong>{myListings.length}</strong>
        </p>

        {!user ? (
          <p>Please log in.</p>
        ) : myListings.length === 0 ? (
          <p>No listings found for this user.</p>
        ) : (
          <div>
            {myListings.map((listing) => (
              <div key={listing._id} className="simple-listing-card">
                <h3>{listing.title}</h3>
                <p>{listing.description}</p>
                <p>
                  <strong>Type:</strong> {listing.type}
                </p>
                <p>
                  <strong>Availability:</strong> {listing.availability}
                </p>
                <p>
                  <strong>Created By:</strong> {listing.createdBy}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}