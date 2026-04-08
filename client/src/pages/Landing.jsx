import React from "react";
import Navbar from "../components/Navbar"
import api from "../api/api"
import { useState } from "react"

// Import CSS for Landing page specific styles
import "../styles/landing.css"

export default function Landing() {

const [form, setForm] = useState({
	email: "",
	password: ""
})

const login = async () => {
	await api.post("/auth/login", form)
}

return (
	<div className="landing-bg">
		<Navbar />
		<div className="landing-hero">
			<div className="landing-left">
				<div className="block-card">
					<div className="landing-sub">Your neighborhood’s shared toolbox</div>
					<div className="landing-title">THE BLOCK</div>
				</div>
			</div>
			<div className="landing-login-card">
				<div className="login-header-row">
					<h2 className="login-title">Log In</h2>
					<a className="new-user-link" href="/signup">New User?</a>
				</div>
				<div className="login-label">Username/Email <span className="arrow">→</span></div>
				<input
					className="login-input"
					placeholder="Enter your email"
					value={form.email}
					onChange={e => setForm({ ...form, email: e.target.value })}
				/>
				<div className="login-label">Password <span className="arrow">→</span></div>
				<input
					className="login-input"
					type="password"
					placeholder="Enter your password"
					value={form.password}
					onChange={e => setForm({ ...form, password: e.target.value })}
				/>
				<button className="login-btn" onClick={login}>
					Log In
				</button>
			</div>
		</div>
	</div>
)
}