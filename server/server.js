import express from "express"
import mongoose from "mongoose"
import cors from "cors"

import listingRoutes from "./routes/listingRoutes.js"

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://127.0.0.1:27017/theblock")

app.use("/api/listings", listingRoutes)

app.get("/", (req,res)=>{
 res.send("API running")
})

app.listen(5000, () =>
 console.log("server running on port 5000")
)