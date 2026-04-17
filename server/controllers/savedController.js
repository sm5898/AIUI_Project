import User from "../models/User.js";
import Listing from "../models/Listing.js";

export const getSavedListings = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("savedListings");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.savedListings);
  } catch (error) {
    console.error("GET SAVED LISTINGS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch saved listings" });
  }
};

export const saveListing = async (req, res) => {
  try {
    const { userId, listingId } = req.params;

    const user = await User.findById(userId);
    const listing = await Listing.findById(listingId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const alreadySaved = user.savedListings.some(
      (id) => id.toString() === listingId
    );

    if (!alreadySaved) {
      user.savedListings.push(listingId);
      await user.save();
    }

    res.status(200).json({
      message: "Listing saved successfully",
      savedListings: user.savedListings,
    });
  } catch (error) {
    console.error("SAVE LISTING ERROR:", error);
    res.status(500).json({ message: "Failed to save listing" });
  }
};

export const removeSavedListing = async (req, res) => {
  try {
    const { userId, listingId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.savedListings = user.savedListings.filter(
      (id) => id.toString() !== listingId
    );

    await user.save();

    res.status(200).json({
      message: "Listing removed from saved successfully",
      savedListings: user.savedListings,
    });
  } catch (error) {
    console.error("REMOVE SAVED LISTING ERROR:", error);
    res.status(500).json({ message: "Failed to remove saved listing" });
  }
};