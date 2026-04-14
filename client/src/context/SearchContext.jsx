import React, { createContext, useContext, useState, useEffect } from "react"
import api from "../api/api"

const SearchContext = createContext()

export function SearchProvider({ children }) {
 const [listings, setListings] = useState([])
 const [query, setQuery] = useState("")
 const [filter, setFilter] = useState("all") // "all" | "borrow" | "service"

 useEffect(() => {
  api.get("/listings")
   .then(res => setListings(res.data))
   .catch(() => {})
 }, [])

 const filtered = listings.filter(item => {
  const matchesFilter =
   filter === "all" || item.type?.toLowerCase() === filter
  const matchesQuery =
   !query || item.title?.toLowerCase().includes(query.toLowerCase())
  return matchesFilter && matchesQuery
 })

 return (
  <SearchContext.Provider value={{ listings, filtered, query, setQuery, filter, setFilter }}>
   {children}
  </SearchContext.Provider>
 )
}

export function useSearch() {
 return useContext(SearchContext)
}
