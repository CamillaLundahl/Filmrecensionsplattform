const Movie = require('../models/Movie');
const Review = require('../models/Review');

// Felhanterare för alla controllers
const asyncHandler = fn => (req, res) => 
  Promise.resolve(fn(req, res)).catch(error => {
    console.error(error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  });

// Hjälpfunktion för att skicka svar
const sendResponse = (res, statusCode, data = null, message = null) => {
  const status = statusCode < 400 ? 'success' : 'fail';
  const response = { status };
  
  if (message) response.message = message;
  if (data) response.data = data;
  
  return res.status(statusCode).json(response);
};

// Skapa ny film (endast admin)
exports.createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create(req.body);
  sendResponse(res, 201, { movie });
});

// Hämta alla filmer
exports.getAllMovies = asyncHandler(async (req, res) => {
  const movies = await Movie.find();
  sendResponse(res, 200, { movies, results: movies.length });
});

// Hämta en specifik film
exports.getMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return sendResponse(res, 404, null, 'Ingen film hittades med detta ID');
  sendResponse(res, 200, { movie });
});

// Uppdatera en specifik film (endast admin)
exports.updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!movie) return sendResponse(res, 404, null, 'Ingen film hittades med detta ID');
  sendResponse(res, 200, { movie });
});

// Ta bort en specifik film (endast admin)
exports.deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) return sendResponse(res, 404, null, 'Ingen film hittades med detta ID');
  sendResponse(res, 200, null, `Filmen "${movie.title}" har tagits bort`);
});

// Hämta alla recensioner för en specifik film
exports.getMovieReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ movieId: req.params.id }).populate('userId', 'username');
  sendResponse(res, 200, { reviews, results: reviews.length });
});

// Hämta alla filmer med genomsnittligt betyg
exports.getMoviesWithRatings = asyncHandler(async (req, res) => {
  const moviesWithRatings = await Movie.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'movieId',
        as: 'reviews'
      }
    },
    {
      $addFields: {
        averageRating: { 
          $cond: {
            if: { $gt: [{ $size: "$reviews" }, 0] },
            then: { $avg: "$reviews.rating" },
            else: null
          }
        },
        reviewsCount: { $size: "$reviews" }
      }
    },
    {
      $project: {
        title: 1,
        director: 1,
        releaseYear: 1,
        genre: 1,
        averageRating: 1,
        reviewsCount: 1
      }
    }
  ]);
  
  sendResponse(res, 200, { movies: moviesWithRatings, results: moviesWithRatings.length });
});
