import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const SearchContext = createContext();

const getDistanceMiles = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export function SearchProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const fetchListings = async () => {
    try {
      const res = await api.get("/listings");

      if (!navigator.geolocation) {
        setListings(res.data);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          const listingsWithDistance = res.data.map((listing) => {
            if (
              listing.location?.lat === undefined ||
              listing.location?.lng === undefined
            ) {
              return listing;
            }

            const distance = getDistanceMiles(
              userLat,
              userLng,
              listing.location.lat,
              listing.location.lng
            );

            return {
              ...listing,
              distance: `${distance.toFixed(1)} mi`,
            };
          });

          setListings(listingsWithDistance);
        },
        () => {
          setListings(res.data);
        }
      );
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filtered = listings.filter((item) => {
    const itemType = item.type?.toLowerCase();
    const q = query.toLowerCase();
    const itemAvailability = item.availability?.toLowerCase();

    const matchesFilter =
      filter === "all" ||
      itemType === filter ||
      (filter === "borrow" && itemType === "lend");

    const matchesAvailability =
      availabilityFilter === "all" ||
      itemAvailability === availabilityFilter;

    const matchesQuery =
      !query ||
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q);

    return matchesFilter && matchesQuery && matchesAvailability;
  });

  return (
    <SearchContext.Provider
      value={{
        listings,
        filtered,
        query,
        setQuery,
        filter,
        setFilter,
        availabilityFilter,
        setAvailabilityFilter,
        fetchListings,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}