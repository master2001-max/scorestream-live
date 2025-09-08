const express = require('express');
const {
  getHouses,
  getHouse,
  createHouse,
  updateHouse,
  deleteHouse,
  updateScore,
  getHouseMembers,
  getHouseStats
} = require('../controllers/housesController');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getHouses);
router.get('/:id', getHouse);
router.get('/:id/members', getHouseMembers);
router.get('/:id/stats', getHouseStats);

// Protected routes
router.post('/', auth, authorize('admin'), createHouse);
router.put('/:id', auth, authorize('admin'), updateHouse);
router.delete('/:id', auth, authorize('admin'), deleteHouse);
router.patch('/:id/score', auth, authorize('admin', 'score_uploader'), updateScore);

module.exports = router;
