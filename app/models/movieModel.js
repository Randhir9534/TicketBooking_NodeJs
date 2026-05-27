const mongoose=require('mongoose')
const movieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genre: String,
  language: String,
  duration: Number,
  cast: [String],
  director: String,
  releaseDate: String,
  assignedTheaters: [{
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater' },
    screenNumber: Number,
    showTimings: [String]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);