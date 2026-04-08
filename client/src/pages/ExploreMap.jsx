import React from "react";
import {MapContainer,TileLayer,Marker} from "react-leaflet"
import {useEffect,useState} from "react"
import api from "../api/api"
import Navbar from "../components/Navbar"

export default function ExploreMap(){

const [listings,setListings]=useState([])

useEffect(()=>{

api.get("/listings")
.then(res=>setListings(res.data))

},[])

return(

<div>

<Navbar active="explore"/>

<MapContainer
center={[40.72,-73.98]}
zoom={13}
className="map"
>

<TileLayer
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

{

listings.map(item=>(

<Marker
key={item._id}
position={[item.location.lat,item.location.lng]}
/>

))

}

</MapContainer>

</div>

)

}