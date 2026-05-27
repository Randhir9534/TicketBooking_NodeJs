// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const ReportController = require('../controller/reportController');
const { protect } = require('../middleware/authMiddleware');

//Total bookings per movie
router.get('/movies/bookings', ReportController.getMoviesWithTotalBookings);

//Bookings grouped by theater
router.get('/bookings/theaters', ReportController.getBookingsByTheater);

//Send booking summary to user email
router.get('/bookings/summary',protect, ReportController.sendBookingSummaryToUser);

module.exports = router;
