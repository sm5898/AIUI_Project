import express from 'express';
import reviewController from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';
const router = express.Router();

// Create a review (after borrow/service complete)
router.post('/', requireAuth, reviewController.createReview);


// Get all reviews for a user
router.get('/:userId', reviewController.getUserReviews);

// Get all reviews for a listing
router.get('/listing/:listingId', reviewController.getListingReviews);

export default router;
