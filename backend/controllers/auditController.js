const pool = require('../db');

const logAction = async (userId, action, details) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, action, details]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await pool.query(`
      SELECT al.*, u.name as user_name, u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);
    res.json(logs.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { logAction, getAuditLogs };