const express = require('express');
const movieController = require('../controllers/movieController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Publika routes - alla kan hämta filmer
router.get('/', movieController.getAllMovies);
router.get('/ratings', movieController.getMoviesWithRatings);
router.get('/:id', movieController.getMovie);
router.get('/:id/reviews', movieController.getMovieReviews);

// Skyddade routes - kräver inloggning
router.use(protect);

// Admin-only routes - endast admin kan skapa, uppdatera, ta bort filmer
router.post('/', restrictTo('admin'), movieController.createMovie);
router.put('/:id', restrictTo('admin'), movieController.updateMovie);
router.delete('/:id', restrictTo('admin'), movieController.deleteMovie);

module.exports = router;
