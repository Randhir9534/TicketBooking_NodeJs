const mongoose=require('mongoose')
const theaterSchema = new mongoose.Schema({
  theater: { type: String, required: true },
  location: String,
  screens: Number
}, { timestamps: true });

module.exports = mongoose.model('Theater', theaterSchema);