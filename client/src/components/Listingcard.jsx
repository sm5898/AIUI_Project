import React from "react";
import "../styles/cards.css"

export default function ListingCard({listing}){

return(

<div className="card">

<div className="card-type">

{listing.type}

</div>

<h2>

{listing.title}

</h2>

<img src={listing.image}/>

</div>

)

}