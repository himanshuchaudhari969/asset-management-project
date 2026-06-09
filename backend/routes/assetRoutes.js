const express = require('express');
const router = express.Router();
const { getAssets, getAssetById, createAsset, updateAsset, deleteAsset } = require('../controllers/assetController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User routes
router.get('/', protect, getAssets);
router.get('/:id', protect, getAssetById);

// Admin only routes
router.post('/', protect, adminOnly, createAsset);
router.put('/:id', protect, adminOnly, updateAsset);
router.delete('/:id', protect, adminOnly, deleteAsset);

module.exports = router;
