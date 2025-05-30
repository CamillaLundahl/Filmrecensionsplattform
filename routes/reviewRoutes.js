const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); 

// Routes utan ID
router.route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

// Hämta recensioner baserat på film-ID
router.route('/movie/:movieId')
  .get(reviewController.getReviewsByMovieId);

// Routes med ID
router.route('/:id')
  .get(reviewController.getReview)
  .put(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
