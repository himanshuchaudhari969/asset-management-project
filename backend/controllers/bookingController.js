const pool = require('../db');
const { logAction } = require('./auditController');
const { createNotification } = require('./notificationController');

const createBooking = async (req, res) => {
  const { asset_id, start_date, end_date, reason } = req.body;
  try {
    const asset = await pool.query('SELECT * FROM assets WHERE id = $1', [asset_id]);
    if (asset.rows.length === 0) {
      return res.status(404).json({ message: 'Asset nahi mila' });
    }
    if (asset.rows[0].available <= 0) {
      return res.status(400).json({ message: 'Asset available nahi hai' });
    }
    const booking = await pool.query(
      'INSERT INTO bookings (user_id, asset_id, start_date, end_date, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, asset_id, start_date, end_date, reason]
    );

    // Audit log
    await logAction(req.user.id, 'BOOKING_CREATED', `Asset: ${asset.rows[0].name}, Dates: ${start_date} to ${end_date}`);

    // Admin ko notification
    const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    for (const admin of admins.rows) {
      await createNotification(admin.id, `Naya booking request: ${asset.rows[0].name} by ${req.user.name}`);
    }

    res.status(201).json(booking.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await pool.query(
      `SELECT b.*, a.name as asset_name, a.category 
       FROM bookings b 
       JOIN assets a ON b.asset_id = a.id 
       WHERE b.user_id = $1 
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(bookings.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await pool.query(
      `SELECT b.*, a.name as asset_name, a.category, u.name as user_name, u.email
       FROM bookings b
       JOIN assets a ON b.asset_id = a.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    res.json(bookings.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const booking = await pool.query(
      `SELECT b.*, a.name as asset_name FROM bookings b 
       JOIN assets a ON b.asset_id = a.id 
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (booking.rows.length === 0) {
      return res.status(404).json({ message: 'Booking nahi mili' });
    }

    if (status === 'approved') {
      await pool.query('UPDATE assets SET available = available - 1 WHERE id = $1', [booking.rows[0].asset_id]);
    }
    if (status === 'returned') {
      await pool.query('UPDATE assets SET available = available + 1 WHERE id = $1', [booking.rows[0].asset_id]);
    }

    const updated = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    // Audit log
    await logAction(req.user.id, 'BOOKING_STATUS_UPDATED', `Booking ID: ${req.params.id}, Status: ${status}, Asset: ${booking.rows[0].asset_name}`);

    // User ko notification
    const statusMsg = status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'returned mark';
    await createNotification(booking.rows[0].user_id, `Teri booking "${booking.rows[0].asset_name}" ko ${statusMsg} kar diya gaya!`);

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };



