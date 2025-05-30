const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'En titel måste anges'],
    trim: true
  },
  director: {
    type: String,
    required: [true, 'En regissör måste anges'],
    trim: true
  },
  releaseYear: {
    type: Number,
    required: [true, 'Ett utgivningsår måste anges']
  },
  genre: {
    type: String,
    required: [true, 'En genre måste anges'],
    trim: true
  }
}, {
  timestamps: true
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
