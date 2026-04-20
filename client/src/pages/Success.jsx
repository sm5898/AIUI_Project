import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/global.css";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="page-root">
      <Navbar />
      <div className="page-center">
        <h2>Account created successfully</h2>
        <p>Welcome to THE BLOCK</p>
        <button style={{ marginTop: "16px" }} onClick={() => navigate("/explore")}>Start Exploring</button>
      </div>
    </div>
  );
}