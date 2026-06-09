const pool = require('../db');
const { logAction } = require('./auditController');

const getAssets = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM assets';
    let params = [];
    let conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const assets = await pool.query(query, params);
    res.json(assets.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createAsset = async (req, res) => {
  const { name, category, quantity, description } = req.body;
  try {
    const asset = await pool.query(
      'INSERT INTO assets (name, category, quantity, available, description) VALUES ($1, $2, $3, $3, $4) RETURNING *',
      [name, category, quantity, description]
    );
    await logAction(req.user.id, 'ASSET_CREATED', `Asset: ${name}, Category: ${category}, Quantity: ${quantity}`);
    res.status(201).json(asset.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateAsset = async (req, res) => {
  const { name, category, quantity, description } = req.body;
  try {
    const asset = await pool.query(
      'UPDATE assets SET name=$1, category=$2, quantity=$3, description=$4 WHERE id=$5 RETURNING *',
      [name, category, quantity, description, req.params.id]
    );
    await logAction(req.user.id, 'ASSET_UPDATED', `Asset ID: ${req.params.id}, Name: ${name}`);
    res.json(asset.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const asset = await pool.query('SELECT * FROM assets WHERE id = $1', [req.params.id]);
    await pool.query('DELETE FROM assets WHERE id = $1', [req.params.id]);
    await logAction(req.user.id, 'ASSET_DELETED', `Asset: ${asset.rows[0]?.name}`);
    res.json({ message: 'Asset delete ho gaya' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAssets, createAsset, updateAsset, deleteAsset };
