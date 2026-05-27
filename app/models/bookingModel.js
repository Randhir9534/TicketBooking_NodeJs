const mongoose=require('mongoose')
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater' },
  showTimings: String,
  tickets: Number,
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Booked', 'Cancelled'], default: 'Booked' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);