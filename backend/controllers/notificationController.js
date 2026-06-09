const pool = require('../db');

const createNotification = async (userId, message) => {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [userId, message]
    );
  } catch (err) {
    console.error('Notification error:', err);
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(notifications.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ message: 'Saari notifications read mark ho gayi' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createNotification, getMyNotifications, markAsRead };