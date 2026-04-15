import Listing from "../models/Listing.js";

// GET all listings
export const getListings = async (req, res) => {
  try {
    const { type, search, availability } = req.query;

    const filter = {};

    if (type && type !== "all") {
      filter.type = type.toLowerCase();
    }

    if (availability) {
      filter.availability = { $regex: availability, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching listings",
      error: error.message,
    });
  }
};

// GET one listing by ID
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching listing",
      error: error.message,
    });
  }
};

// POST create listing
export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      company,
      image,
      availability,
      location,
      createdBy,
    } = req.body;

    if (
      !title ||
      !description ||
      !type ||
      !availability ||
      !location ||
      location.lat === undefined ||
      location.lng === undefined ||
      !createdBy
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: title, description, type, availability, location.lat, location.lng, createdBy",
      });
    }

    const newListing = new Listing({
      title,
      description,
      type: type.toLowerCase(),
      company,
      image,
      availability,
      location,
      createdBy,
    });

    const savedListing = await newListing.save();

    res.status(201).json(savedListing);
  } catch (error) {
    res.status(500).json({
      message: "Error creating listing",
      error: error.message,
    });
  }
};

// PUT update listing
export const updateListing = async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(updatedListing);
  } catch (error) {
    res.status(500).json({
      message: "Error updating listing",
      error: error.message,
    });
  }
};

// DELETE listing
export const deleteListing = async (req, res) => {
  try {
    const deletedListing = await Listing.findByIdAndDelete(req.params.id);

    if (!deletedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting listing",
      error: error.message,
    });
  }
};
