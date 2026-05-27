const mongoose=require('mongoose')
const Booking = require('../models/bookingModel');
const Movie = require('../models/movieModel');
const Theater = require('../models/theaterModel');


 class bookingController{
  async addBooking (req, res) {
  try {
    const { movieId, theaterId, showTiming, tickets } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const theater = await Theater.findById(theaterId);
    if (!theater) return res.status(404).json({ message: 'Theater not found' });

    const show = movie.assignedTheaters.find(
      at => at.theater && at.theater.toString() === theaterId && at.showTimings.includes(showTiming)
    );
    if (!show) return res.status(400).json({ message: 'Invalid show timing for the selected theater' });

    const booking = await Booking.create({
      user: req.user.id,
      movie: movieId,
      theater: theaterId,
      showTiming,
      tickets
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add booking', error: err.message });
  }
};

async cancelBooking (req, res){
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel booking', error: err.message });
  }
};

async getUserBookings(req, res) {
  try {
    console.log("userdata",req.user);
    
    const bookings = await Booking.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(req.user.id) }
      },
      {
        $lookup: {
          from: 'movies',
          localField: 'movie',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      { $unwind: '$movieDetails' },
      {
        $lookup: {
          from: 'theaters',
          localField: 'theater',
          foreignField: '_id',
          as: 'theaterDetails'
        }
      },
      { $unwind: '$theaterDetails' },
      {
        $project: {
          _id: 1,
          bookingDate: 1,
          seats: 1,
          movie: '$movieDetails',
          theater: '$theaterDetails'
        }
      }
    ]);

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
}


async getAllBookings(req, res) {
  try {
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $lookup: {
          from: 'movies',
          localField: 'movie',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      { $unwind: '$movieDetails' },
      {
        $lookup: {
          from: 'theaters',
          localField: 'theater',
          foreignField: '_id',
          as: 'theaterDetails'
        }
      },
      { $unwind: '$theaterDetails' },
      {
        $project: {
          _id: 1,
          bookingDate: 1,
          seats: 1,
          user: {
            name: '$userDetails.name',
            email: '$userDetails.email'
          },
          movie: {
            name: '$movieDetails.name'
          },
          theater: {
            name: '$theaterDetails.name',
            location: '$theaterDetails.location'
          }
        }
      }
    ]);

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all bookings', error: err.message });
  }
}

 }
 module.exports=new bookingController()
