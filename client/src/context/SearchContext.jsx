import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchListings = async () => {
    try {
      const res = await api.get("/listings");
      console.log("Fetched listings:", res.data);
      setListings(res.data);
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

    const matchesFilter =
      filter === "all" ||
      itemType === filter ||
      (filter === "borrow" && itemType === "lend");

    const matchesQuery =
      !query ||
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q);

    return matchesFilter && matchesQuery;
  });

  return (
    <SearchContext.Provider
      value={{
        listings,
        setListings,
        fetchListings,
        filtered,
        query,
        setQuery,
        filter,
        setFilter,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}