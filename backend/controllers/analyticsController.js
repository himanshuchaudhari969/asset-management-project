const pool = require('../db');

const getAnalytics = async (req, res) => {
  try {
    // Most used assets
    const mostUsed = await pool.query(`
      SELECT a.name, a.category, COUNT(b.id) as booking_count
      FROM assets a
      LEFT JOIN bookings b ON a.id = b.asset_id
      GROUP BY a.id, a.name, a.category
      ORDER BY booking_count DESC
      LIMIT 5
    `);

    // Booking status distribution
    const statusDist = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM bookings
      GROUP BY status
    `);

    // Monthly bookings (last 6 months)
    const monthlyBookings = await pool.query(`
      SELECT TO_CHAR(created_at, 'Mon YYYY') as month,
             COUNT(*) as count
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

    // Overdue returns
    const overdue = await pool.query(`
      SELECT b.*, a.name as asset_name, u.name as user_name
      FROM bookings b
      JOIN assets a ON b.asset_id = a.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'approved' AND b.end_date < CURRENT_DATE
    `);

    // Asset utilization
    const utilization = await pool.query(`
      SELECT a.name, a.quantity, a.available,
             ROUND(((a.quantity - a.available)::numeric / NULLIF(a.quantity, 0)) * 100, 1) as utilization_rate
      FROM assets a
      ORDER BY utilization_rate DESC
    `);

    res.json({
      mostUsed: mostUsed.rows,
      statusDist: statusDist.rows,
      monthlyBookings: monthlyBookings.rows,
      overdue: overdue.rows,
      utilization: utilization.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAnalytics };