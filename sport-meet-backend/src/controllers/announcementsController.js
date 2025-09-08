const Announcement = require('../models/Announcement');
const User = require('../models/User');

// Get all announcements
const getAnnouncements = async (req, res) => {
  try {
    const { limit = 50, page = 1, priority, house } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by house (for house-specific announcements)
    if (house) {
      query.$or = [
        { house: house },
        { house: { $exists: false } } // Global announcements
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name role')
      .populate('house', 'name color')
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single announcement
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name role house');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create announcement (Admin, Captain, Score Uploader)
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, house } = req.body;

    // Validation
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ message: 'Title must be less than 200 characters' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: 'Message must be less than 1000 characters' });
    }

    // House captains can only post to their own house
    let announcementHouse = null;
    if (req.user.role === 'captain') {
      if (house && house !== req.user.house?.toString()) {
        return res.status(403).json({ message: 'Captains can only post announcements for their own house' });
      }
      announcementHouse = req.user.house;
    } else if (house) {
      // Admin and score uploaders can post to any house
      announcementHouse = house;
    }

    const announcement = new Announcement({
      title,
      message,
      priority: priority || 'medium',
      house: announcementHouse,
      createdBy: req.user.id
    });

    await announcement.save();
    await announcement.populate('createdBy', 'name role');
    await announcement.populate('house', 'name color');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('new-announcement', announcement);
      if (announcementHouse) {
        io.to(`house-${announcementHouse}`).emit('new-announcement', announcement);
      }
    }

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update announcement (Admin, or creator)
const updateAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && announcement.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }

    announcement.title = title || announcement.title;
    announcement.message = message || announcement.message;

    await announcement.save();
    await announcement.populate('createdBy', 'name role house');

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete announcement (Admin, or creator)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && announcement.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent announcements (for homepage)
const getRecentAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name role house')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get announcements by house
const getAnnouncementsByHouse = async (req, res) => {
  try {
    const { houseId } = req.params;
    const { limit = 20 } = req.query;

    const announcements = await Announcement.find({
      $or: [
        { house: houseId },
        { house: { $exists: false } } // Global announcements
      ],
      isActive: true
    })
    .populate('createdBy', 'name role')
    .populate('house', 'name color')
    .sort({ priority: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements by house error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle announcement status (Admin only)
const toggleAnnouncementStatus = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    res.json({
      message: `Announcement ${announcement.isActive ? 'activated' : 'deactivated'} successfully`,
      announcement
    });
  } catch (error) {
    console.error('Toggle announcement status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get announcement statistics
const getAnnouncementStats = async (req, res) => {
  try {
    const totalAnnouncements = await Announcement.countDocuments();
    const activeAnnouncements = await Announcement.countDocuments({ isActive: true });
    const urgentAnnouncements = await Announcement.countDocuments({ priority: 'urgent', isActive: true });

    // Get announcements by priority
    const priorityStats = await Announcement.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent announcements by creator
    const creatorStats = await Announcement.aggregate([
      { $match: { isActive: true } },
      { $group: { 
        _id: '$createdBy', 
        count: { $sum: 1 },
        lastCreated: { $max: '$createdAt' }
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'creator'
      }},
      { $unwind: '$creator' },
      { $project: {
        creatorName: '$creator.name',
        creatorRole: '$creator.role',
        count: 1,
        lastCreated: 1
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalAnnouncements,
      activeAnnouncements,
      urgentAnnouncements,
      priorityStats,
      creatorStats
    });
  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getRecentAnnouncements,
  getAnnouncementsByHouse,
  toggleAnnouncementStatus,
  getAnnouncementStats
};
