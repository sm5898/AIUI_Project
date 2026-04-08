import React from "react";
import {useEffect,useState} from "react"
import api from "../api/api"
import ListingCard from "../components/Listingcard"
import Navbar from "../components/Navbar"

export default function ListView(){

const [listings,setListings]=useState([])

useEffect(()=>{

api.get("/listings")
.then(res=>setListings(res.data))

},[])

return(

<div>

<Navbar active="explore"/>

<div className="grid-list">

{

listings.map(item=>(

<ListingCard
key={item._id}
listing={item}
/>

))

}

</div>

</div>

)

}