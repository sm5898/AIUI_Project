import React from "react";
import "../styles/navbar.css"

export default function Navbar({active}){

return(

<div className="navbar">

<div className="logo">

<div/>
<div/>
<div/>
<div/>

</div>

<div className="nav-pill">

<span className={active==="explore"?"active":""}>Explore</span>

<span className={active==="messages"?"active":""}>Messages</span>

<span className={active==="post"?"active":""}>Post</span>

</div>

<div className="avatar"> {/*Placeholder for user initials or avatar image*/}
    AS 
</div>

</div>

)

}