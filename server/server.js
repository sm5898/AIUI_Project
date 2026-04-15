const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const listingRoutes = require("./routes/listingRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/listings", listingRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("The Block backend is running");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });