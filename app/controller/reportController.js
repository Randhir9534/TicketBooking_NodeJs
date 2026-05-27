const sendEmail = require('../helper/sendEmail');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const mongoose=require('mongoose')

class ReportController {

  // 1. List of Movies with Total Bookings
  async getMoviesWithTotalBookings(req, res) {
    try {
      const result = await Booking.aggregate([
        {
          $group: {
            _id: "$movie",
            totalTickets: { $sum: "$tickets" }
          }
        },
        {
          $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "movie"
          }
        },
        { $unwind: "$movie" },
        {
          $project: {
            _id: 0,
            movieId: "$movie._id",
            title: "$movie.title",
            totalTickets: 1
          }
        }
      ]);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching movie bookings report", error });
    }
  }

  // 2. List of Bookings by Theater
  async getBookingsByTheater(req, res) {
    try {
      const result = await Booking.aggregate([
        {
          $group: {
            _id: { theater: "$theater", movie: "$movie", showTimings: "$showTimings" },
            totalTickets: { $sum: "$tickets" }
          }
        },
        {
          $lookup: {
            from: "movies",
            localField: "_id.movie",
            foreignField: "_id",
            as: "movie"
          }
        },
        {
          $lookup: {
            from: "theaters",
            localField: "_id.theater",
            foreignField: "_id",
            as: "theater"
          }
        },
        { $unwind: "$movie" },
        { $unwind: "$theater" },
        {
          $project: {
            _id: 0,
            theaterName: "$theater.name",
            movieTitle: "$movie.title",
            showTime: "$_id.showTimings",
            totalTickets: 1
          }
        }
      ]);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings by theater", error });
    }
  }

  // 3. Send Booking Summary to User Email
  async sendBookingSummaryToUser(req, res) {
      try {
        const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
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

      if (bookings.length === 0) {
        return res.status(200).json({ message: 'No bookings found for this user.' });
      }

      const tableHTML = `
  <h2>Your Booking Summary</h2>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
    <tr>
      <th>Movie</th>
      <th>Theater</th>
      <th>Show Time(s)</th>
      <th>Language</th>
      <th>Location</th>
      <th>Booking Date</th>
    </tr>
    ${bookings.map(b => {
      // Find the matching assignedTheater for this booking's theater
      const assignedTheater = b.movie.assignedTheaters.find(at => 
        at.theater?.toString() === b.theater._id.toString() || !at.theater // Handle missing theater field
      );

      const showTimes = assignedTheater && assignedTheater.showTimings.length > 0 
        ? assignedTheater.showTimings.join(', ')
        : 'N/A';

      return `
        <tr>
          <td>${b.movie.name}</td>
          <td>${b.theater.name}</td>
          <td>${showTimes}</td>
          <td>${b.movie.language}</td>
          <td>${b.theater.location}</td>
          <td>${new Date(b.bookingDate).toLocaleString()}</td>
        </tr>
      `;
    }).join('')}
  </table>`;


      await sendEmail({
        to: user.email,
        subject: 'Your Booking Summary',
        html: tableHTML,
      });

      res.status(200).json({ message: 'Booking summary sent to email successfully.' });

    } catch (error) {
      console.error('Send summary error:', error);
      res.status(500).json({
        message: 'Failed to send booking summary',
        error: error.message || 'Unknown error',
      });
    }
  }
}

module.exports = new ReportController();
