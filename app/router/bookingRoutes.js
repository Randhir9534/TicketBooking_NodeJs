const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const bookingController = require('../controller/bookingController');

router.use(protect);

router.post('/add', bookingController.addBooking);
router.delete('/:id', bookingController.cancelBooking);
router.get('/my', bookingController.getUserBookings);
router.get('/', authorizeRoles('Admin'), bookingController.getAllBookings);

module.exports = router;