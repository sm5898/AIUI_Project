import User from "../models/User.js";
import Listing from "../models/Listing.js";

// GET /api/profile/me
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Count their listings
    const listingCount = await Listing.countDocuments({ createdBy: user.firstName });

    // Fetch their most recent 3 listings for the profile cards
    const myListings = await Listing.find({ createdBy: user.firstName })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      user,
      stats: {
        listingCount,
      },
      myListings,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// PUT /api/profile/me
export const updateProfile = async (req, res) => {
  try {
    const { bio, location, photo, firstName, lastName } = req.body;

    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (photo !== undefined) updates.photo = photo;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};
