const Review = require('../models/Review');
const Movie = require('../models/Movie');

// Hjälpfunktioner
const asyncHandler = fn => (req, res) => 
  Promise.resolve(fn(req, res)).catch(error => {
    console.error(error);
    res.status(400).json({ status: 'fail', message: error.message });
  });

const sendResponse = (res, statusCode, data = null, message = null) => {
  const status = statusCode < 400 ? 'success' : 'fail';
  const response = { status };
  
  if (message) response.message = message;
  if (data) response.data = data;
  
  res.status(statusCode).json(response);
};

// Controller-funktioner
exports.createReview = asyncHandler(async (req, res) => {
  // Kontrollera att filmen finns
  const movie = await Movie.findById(req.body.movieId);
  if (!movie) 
    return sendResponse(res, 404, null, 'Ingen film hittades med detta ID');

  // Skapa recension med användarens ID
  const review = await Review.create({
    ...req.body,
    userId: req.user.id 
  });

  sendResponse(res, 201, { review });
});

exports.getAllReviews = asyncHandler(async (req, res) => {
  // Filtrera recensioner baserat på movieId
  const filter = req.query.movieId ? { movieId: req.query.movieId } : {};
  
  const reviews = await Review.find(filter)
    .populate('userId', 'username')
    .populate('movieId', 'title');

  sendResponse(res, 200, { reviews, results: reviews.length });
});

exports.getReviewsByMovieId = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ movieId: req.params.movieId })
    .populate('userId', 'username')
    .populate('movieId', 'title');
  
  sendResponse(res, 200, { reviews, results: reviews.length });
});

exports.getReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('userId', 'username')
    .populate('movieId', 'title');

  if (!review) 
    return sendResponse(res, 404, null, 'Ingen recension hittades med detta ID');

  sendResponse(res, 200, { review });
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) 
    return sendResponse(res, 404, null, 'Ingen recension hittades med detta ID');

  // Kontrollera behörighet
  if (review.userId.toString() !== req.user.id)
    return sendResponse(res, 403, null, 
      'Behörighet nekad: Endast skaparen av recensionen kan uppdatera denna recension');

  // Uppdatera och returnera den uppdaterade recensionen
  const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  sendResponse(res, 200, { review: updatedReview });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).populate('movieId', 'title');

  if (!review) 
    return sendResponse(res, 404, null, 'Ingen recension hittades med detta ID');

  // Kontrollera behörighet
  if (review.userId.toString() !== req.user.id && req.user.role !== 'admin')
    return sendResponse(res, 403, null, 'Du har inte behörighet att ta bort denna recension');

  const movieTitle = review.movieId ? review.movieId.title : 'okänd film';
  
  await Review.findByIdAndDelete(req.params.id);

  sendResponse(res, 200, null, `Recensionen för "${movieTitle}" har tagits bort`);
});
