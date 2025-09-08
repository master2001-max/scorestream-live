const express = require('express');
const { auth, authorize } = require('../middlewares/auth');
const { updateScores } = require('../controllers/scoresController');

const router = express.Router();

// Update scores for a match (Admin, Score Uploader)
router.patch('/:id', auth, authorize('admin', 'score_uploader'), updateScores);

module.exports = router;


