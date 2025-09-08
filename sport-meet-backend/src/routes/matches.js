const express = require('express');
const {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  getLiveMatches,
  getUpcomingMatches,
  getFinishedMatches,
  startMatch,
  finishMatch,
  getMatchStats
} = require('../controllers/matchesController');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getMatches);
router.get('/live', getLiveMatches);
router.get('/upcoming', getUpcomingMatches);
router.get('/finished', getFinishedMatches);
router.get('/stats', getMatchStats);
router.get('/:id', getMatch);

// Protected routes
router.post('/', auth, authorize('admin', 'score_uploader'), createMatch);
router.put('/:id', auth, authorize('admin', 'score_uploader'), updateMatch);
router.delete('/:id', auth, authorize('admin'), deleteMatch);
router.patch('/:id/start', auth, authorize('admin', 'score_uploader'), startMatch);
router.patch('/:id/finish', auth, authorize('admin', 'score_uploader'), finishMatch);

module.exports = router;
