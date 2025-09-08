const express = require('express');
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getRecentAnnouncements,
  getAnnouncementsByHouse,
  toggleAnnouncementStatus,
  getAnnouncementStats
} = require('../controllers/announcementsController');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', getAnnouncements);
router.get('/recent', getRecentAnnouncements);
router.get('/stats', getAnnouncementStats);
router.get('/house/:houseId', getAnnouncementsByHouse);
router.get('/:id', getAnnouncement);

// Protected routes
router.post('/', auth, authorize('admin', 'captain', 'score_uploader'), createAnnouncement);
router.put('/:id', auth, updateAnnouncement);
router.delete('/:id', auth, deleteAnnouncement);
router.patch('/:id/toggle', auth, authorize('admin'), toggleAnnouncementStatus);

module.exports = router;
