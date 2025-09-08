const House = require('../models/House');
const User = require('../models/User');
const Match = require('../models/Match');

// Get all houses with leaderboard
const getHouses = async (req, res) => {
  try {
    const houses = await House.find({ isActive: true })
      .populate('captain', 'name email')
      .sort({ totalScore: -1, name: 1 });
    
    // Get additional stats for each house
    const housesWithStats = await Promise.all(
      houses.map(async (house) => {
        const matches = await Match.find({
          $or: [{ house1: house._id }, { house2: house._id }],
          status: 'finished'
        });
        
        const wins = matches.filter(match => match.winner?.toString() === house._id.toString()).length;
        const losses = matches.filter(match => 
          match.winner && match.winner.toString() !== house._id.toString()
        ).length;
        const draws = matches.filter(match => !match.winner).length;
        
        return {
          ...house.toObject(),
          stats: {
            totalMatches: matches.length,
            wins,
            losses,
            draws
          }
        };
      })
    );
    
    res.json(housesWithStats);
  } catch (error) {
    console.error('Get houses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single house
const getHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id).populate('captain', 'name email');
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }
    res.json(house);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create house (Admin only)
const createHouse = async (req, res) => {
  try {
    const { name, color, captainId, motto, description } = req.body;

    // Validation
    if (!name || !color) {
      return res.status(400).json({ message: 'Name and color are required' });
    }

    // Validate color format
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({ message: 'Color must be a valid hex color (e.g., #FF0000)' });
    }

    // Check if house already exists
    const existingHouse = await House.findOne({ name });
    if (existingHouse) {
      return res.status(400).json({ message: 'House already exists' });
    }

    // Validate captain if provided
    if (captainId) {
      const captain = await User.findById(captainId);
      if (!captain) {
        return res.status(400).json({ message: 'Captain not found' });
      }
      if (captain.house) {
        return res.status(400).json({ message: 'Captain is already assigned to a house' });
      }
    }

    const house = new House({
      name,
      color,
      captain: captainId,
      motto,
      description
    });

    await house.save();

    // If captain is specified, update their house and role
    if (captainId) {
      await User.findByIdAndUpdate(captainId, { 
        house: house._id,
        role: 'captain'
      });
    }

    // Populate captain data for response
    const populatedHouse = await House.findById(house._id).populate('captain', 'name email');

    res.status(201).json({
      message: 'House created successfully',
      house: populatedHouse
    });
  } catch (error) {
    console.error('Create house error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update house (Admin only)
const updateHouse = async (req, res) => {
  try {
    const { name, color, captainId } = req.body;
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    // Check if new name conflicts with existing house
    if (name && name !== house.name) {
      const existingHouse = await House.findOne({ name });
      if (existingHouse) {
        return res.status(400).json({ message: 'House name already exists' });
      }
    }

    house.name = name || house.name;
    house.color = color || house.color;
    
    if (captainId) {
      // Remove captain role from previous captain
      if (house.captain) {
        await User.findByIdAndUpdate(house.captain, { role: 'student' });
      }
      
      // Set new captain
      house.captain = captainId;
      await User.findByIdAndUpdate(captainId, { 
        house: house._id,
        role: 'captain'
      });
    }

    await house.save();
    res.json(house);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete house (Admin only)
const deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    // Remove captain role from captain
    if (house.captain) {
      await User.findByIdAndUpdate(house.captain, { 
        role: 'student',
        house: null
      });
    }

    // Update all users in this house
    await User.updateMany(
      { house: house._id },
      { house: null }
    );

    await House.findByIdAndDelete(req.params.id);
    res.json({ message: 'House deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update house score
const updateScore = async (req, res) => {
  try {
    const { score } = req.body;
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    if (score < 0) {
      return res.status(400).json({ message: 'Score cannot be negative' });
    }

    house.totalScore = score;
    await house.save();

    res.json({
      message: 'Score updated successfully',
      house
    });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get house members
const getHouseMembers = async (req, res) => {
  try {
    const houseId = req.params.id;
    const house = await House.findById(houseId);
    
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    const members = await User.find({ house: houseId })
      .select('-password')
      .populate('house', 'name color')
      .sort({ role: 1, name: 1 });

    res.json({
      house: {
        id: house._id,
        name: house.name,
        color: house.color
      },
      members
    });
  } catch (error) {
    console.error('Get house members error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get house statistics
const getHouseStats = async (req, res) => {
  try {
    const houseId = req.params.id;
    const house = await House.findById(houseId);
    
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    // Get all matches for this house
    const matches = await Match.find({
      $or: [{ house1: houseId }, { house2: houseId }]
    }).populate('house1 house2', 'name color');

    const finishedMatches = matches.filter(match => match.status === 'finished');
    const liveMatches = matches.filter(match => match.status === 'live');
    const upcomingMatches = matches.filter(match => match.status === 'upcoming');

    const wins = finishedMatches.filter(match => match.winner?.toString() === houseId.toString()).length;
    const losses = finishedMatches.filter(match => 
      match.winner && match.winner.toString() !== houseId.toString()
    ).length;
    const draws = finishedMatches.filter(match => !match.winner).length;

    // Get recent announcements for this house
    const Announcement = require('../models/Announcement');
    const announcements = await Announcement.find({
      $or: [
        { house: houseId },
        { house: { $exists: false } } // Global announcements
      ],
      isActive: true
    })
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      house: {
        id: house._id,
        name: house.name,
        color: house.color,
        totalScore: house.totalScore
      },
      stats: {
        totalMatches: matches.length,
        finishedMatches: finishedMatches.length,
        liveMatches: liveMatches.length,
        upcomingMatches: upcomingMatches.length,
        wins,
        losses,
        draws,
        winRate: finishedMatches.length > 0 ? (wins / finishedMatches.length * 100).toFixed(1) : 0
      },
      recentAnnouncements: announcements
    });
  } catch (error) {
    console.error('Get house stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getHouses,
  getHouse,
  createHouse,
  updateHouse,
  deleteHouse,
  updateScore,
  getHouseMembers,
  getHouseStats
};
