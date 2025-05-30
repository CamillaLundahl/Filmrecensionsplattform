const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'En film måste anges']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'En användare måste anges']
  },
  rating: {
    type: Number,
    required: [true, 'Ett betyg måste anges'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'En kommentar måste anges'],
    trim: true
  }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
