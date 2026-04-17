import React from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom"
import { SearchProvider } from "./context/SearchContext"

import Landing from "./pages/Landing"
import Signup from "./pages/Signup"
import Success from "./pages/Success"
import ExploreMap from "./pages/ExploreMap"
import ListView from "./pages/Listview"
import Messages from "./pages/Messages"
import CreatePost from "./pages/Createpost"
import MyListings from "./pages/MyListings"
import ListingDetail from "./pages/ListingDetail"
import Welcome from "./pages/Welcome"
import Profile from "./pages/Profile"
import Onboarding from "./pages/Onboarding"

export default function App(){
  return(
    <SearchProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome/>}/>
          <Route path="/login" element={<Landing/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/success" element={<Success/>}/>
          <Route path="/explore" element={<ExploreMap/>}/>
          <Route path="/list" element={<ListView/>}/>
          <Route path="/messages" element={<Messages/>}/>
          <Route path="/create" element={<CreatePost/>}/>
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/listing/:id" element={<ListingDetail/>}/>
          <Route path="/profile" element={<Profile />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </BrowserRouter>
    </SearchProvider>
  )
}