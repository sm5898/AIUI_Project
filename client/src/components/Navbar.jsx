import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import "../styles/navbar.css"

export default function Navbar({ active, locked }) {
 const navigate = useNavigate()
 const [toast, setToast] = useState(false)

 const go = (path) => {
  if (locked) {
   setToast(true)
   setTimeout(() => setToast(false), 3000)
  } else {
   navigate(path)
  }
 }

 return (
  <div className="navbar">
   <div className="logo">
    <div/>
    <div/>
    <div/>
    <div/>
   </div>

   <div className="nav-pill">
    <span className={active==="explore"?"active":""} onClick={() => go("/explore")}>Explore</span>
    <span className={active==="messages"?"active":""} onClick={() => go("/messages")}>Messages</span>
    <span className={active==="post"?"active":""} onClick={() => go("/create")}>Post</span>
   </div>

   <div className="avatar">AS</div>

   {toast && (
    <div className="nav-toast">Log in or create an account to explore</div>
   )}
  </div>
 )
}