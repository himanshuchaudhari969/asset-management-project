const pool = require('../db');

// Sabhi assets dekho
const getAssets = async (req, res) => {
  try {
    const assets = await pool.query('SELECT * FROM assets ORDER BY created_at DESC');
    res.json(assets.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Single asset dekho
const getAssetById = async (req, res) => {
  try {
    const asset = await pool.query('SELECT * FROM assets WHERE id = $1', [req.params.id]);
    if (asset.rows.length === 0) {
      return res.status(404).json({ message: 'Asset nahi mila' });
    }
    res.json(asset.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Asset banao (admin only)
const createAsset = async (req, res) => {
  const { name, category, quantity, description } = req.body;
  try {
    const newAsset = await pool.query(
      'INSERT INTO assets (name, category, quantity, available, description) VALUES ($1, $2, $3, $3, $4) RETURNING *',
      [name, category, quantity, description]
    );
    res.status(201).json(newAsset.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Asset update karo (admin only)
const updateAsset = async (req, res) => {
  const { name, category, quantity, description } = req.body;
  try {
    const updated = await pool.query(
      'UPDATE assets SET name=$1, category=$2, quantity=$3, description=$4 WHERE id=$5 RETURNING *',
      [name, category, quantity, description, req.params.id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Asset nahi mila' });
    }
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Asset delete karo (admin only)
const deleteAsset = async (req, res) => {
  try {
    const deleted = await pool.query('DELETE FROM assets WHERE id=$1 RETURNING *', [req.params.id]);
    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: 'Asset nahi mila' });
    }
    res.json({ message: 'Asset delete ho gaya' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAssets, getAssetById, createAsset, updateAsset, deleteAsset };
