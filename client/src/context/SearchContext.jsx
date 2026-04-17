import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const SearchContext = createContext();

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export function SearchProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(5); // Default 5 miles
  const [enableDistance, setEnableDistance] = useState(false);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied or unavailable:", error);
        }
      );
    }
  }, []);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      
      if (query) params.append("search", query);
      if (filter !== "all") params.append("type", filter);
      if (availability !== "all") params.append("availability", availability);

      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data);
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [query, filter, availability]);

  const filtered = listings
    .map((item) => {
      if (enableDistance && userLocation && item.location) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          item.location.lat,
          item.location.lng
        );
        return { ...item, distance };
      }
      return item;
    })
    .filter((item) => {
      if (enableDistance && userLocation) {
        return item.distance <= radius;
      }
      return true;
    })
    .sort((a, b) => {
      if (enableDistance) return a.distance - b.distance;
      return 0;
    });

  const clearFilters = () => {
    setQuery("");
    setFilter("all");
    setAvailability("all");
    setRadius(5);
    setEnableDistance(false);
  };

  return (
    <SearchContext.Provider
      value={{
        listings,
        filtered,
        query,
        setQuery,
        filter,
        setFilter,
        availability,
        setAvailability,
        userLocation,
        radius,
        setRadius,
        enableDistance,
        setEnableDistance,
        clearFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}