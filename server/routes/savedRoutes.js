import express from "express";
import {
  getSavedListings,
  saveListing,
  removeSavedListing,
} from "../controllers/savedController.js";

const router = express.Router();

router.get("/:userId", getSavedListings);
router.post("/:userId/:listingId", saveListing);
router.delete("/:userId/:listingId", removeSavedListing);

export default router;