const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);

// Admin only routes
router.get('/all', protect, adminOnly, getAllBookings);
router.put('/:id/status', protect, adminOnly, updateBookingStatus);

module.exports = router;
