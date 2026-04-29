import Review from '../models/Review.js';
import Listing from '../models/Listing.js';

const reviewController = {};

reviewController.getListingReviews = async (req, res) => {
  try {
    const { listingId } = req.params;
    const reviews = await Review.find({ listing: listingId }).populate('reviewer', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};

reviewController.createReview = async (req, res) => {
  try {
    const { reviewee, listing, rating, comment } = req.body;
    const reviewer = req.user._id;
    // Prevent duplicate reviews for the same transaction
    const existing = await Review.findOne({ reviewer, reviewee, listing });
    if (existing) return res.status(400).json({ error: 'You have already reviewed this transaction.' });
    const review = new Review({ reviewer, reviewee, listing, rating, comment });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review.' });
  }
};

reviewController.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId }).populate('reviewer', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};

export default reviewController;
