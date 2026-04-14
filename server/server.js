import express from "express"
import mongoose from "mongoose"
import cors from "cors"

import listingRoutes from "./routes/listingRoutes.js"
import User from "./user.js"

const app = express()

app.use(cors())
app.use(express.json())

mongoose
 .connect("mongodb://127.0.0.1:27017/theblock")
 .catch((error) => {
  console.error("MongoDB connection failed:", error.message)
 })

app.use("/api/listings", listingRoutes)

app.post("/api/auth/signup", async (req, res) => {
 try {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
   return res.status(400).json({ message: "Name, email, and password are required" })
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() })

  if (existingUser) {
   return res.status(409).json({ message: "Email is already registered" })
  }

  const user = await User.create({
   name,
   email: email.toLowerCase(),
   password
  })

  return res.status(201).json({
   id: user._id,
   name: user.name,
   email: user.email
  })
 } catch (error) {
  return res.status(500).json({ message: "Unable to create account" })
 }
})

app.post("/api/auth/login", async (req, res) => {
 try {
  const { email, password } = req.body

  if (!email || !password) {
   return res.status(400).json({ message: "Email and password are required" })
  }

  const user = await User.findOne({ email: email.toLowerCase() })

  if (!user || user.password !== password) {
   return res.status(401).json({ message: "Invalid email or password" })
  }

  return res.json({
   id: user._id,
   name: user.name,
   email: user.email
  })
 } catch (error) {
  return res.status(500).json({ message: "Unable to login" })
 }
})

app.get("/", (req,res)=>{
 res.send("API running")
})

app.listen(5000, () =>
 console.log("server running on port 5000")
)