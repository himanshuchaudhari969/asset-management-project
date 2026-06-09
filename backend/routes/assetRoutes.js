const express = require('express');
const router = express.Router();
const { getAssets, createAsset, updateAsset, deleteAsset } = require('../controllers/assetController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getAssets);
router.post('/', protect, adminOnly, createAsset);
router.put('/:id', protect, adminOnly, updateAsset);
router.delete('/:id', protect, adminOnly, deleteAsset);

module.exports = router;
