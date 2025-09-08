const Match = require('../models/Match');
const House = require('../models/House');

// Get all matches
const getMatches = async (req, res) => {
  try {
    const { status, house } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (house) {
      query.$or = [
        { house1: house },
        { house2: house }
      ];
    }

    const matches = await Match.find(query)
      .populate('house1', 'name color')
      .populate('house2', 'name color')
      .populate('winner', 'name color')
      .populate('createdBy', 'name role')
      .sort({ matchTime: 1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single match
const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('house1', 'name color')
      .populate('house2', 'name color')
      .populate('winner', 'name color')
      .populate('createdBy', 'name role');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create match (Admin, Score Uploader)
const createMatch = async (req, res) => {
  try {
    const { house1, house2, matchTime, sport, description, venue } = req.body;

    // Validation
    if (!house1 || !house2 || !matchTime || !sport) {
      return res.status(400).json({ message: 'House1, house2, matchTime, and sport are required' });
    }

    // Validate houses exist
    const house1Doc = await House.findById(house1);
    const house2Doc = await House.findById(house2);

    if (!house1Doc || !house2Doc) {
      return res.status(400).json({ message: 'One or both houses not found' });
    }

    if (house1 === house2) {
      return res.status(400).json({ message: 'House cannot play against itself' });
    }

    // Validate match time is in the future
    const matchDateTime = new Date(matchTime);
    if (matchDateTime <= new Date()) {
      return res.status(400).json({ message: 'Match time must be in the future' });
    }

    // Check for conflicting matches at the same time
    const conflictingMatch = await Match.findOne({
      $or: [
        { house1: house1, house2: house2 },
        { house1: house2, house2: house1 }
      ],
      matchTime: {
        $gte: new Date(matchDateTime.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
        $lte: new Date(matchDateTime.getTime() + 2 * 60 * 60 * 1000)  // 2 hours after
      }
    });

    if (conflictingMatch) {
      return res.status(400).json({ message: 'A match between these houses already exists at this time' });
    }

    const match = new Match({
      house1,
      house2,
      matchTime: matchDateTime,
      sport,
      description,
      venue,
      createdBy: req.user.id
    });

    await match.save();
    await match.populate('house1', 'name color');
    await match.populate('house2', 'name color');
    await match.populate('createdBy', 'name role');

    res.status(201).json({
      message: 'Match created successfully',
      match
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update match (Admin, Score Uploader)
const updateMatch = async (req, res) => {
  try {
    const { score1, score2, status, description, venue } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Validation for scores
    if (score1 !== undefined && score1 < 0) {
      return res.status(400).json({ message: 'Score1 cannot be negative' });
    }
    if (score2 !== undefined && score2 < 0) {
      return res.status(400).json({ message: 'Score2 cannot be negative' });
    }

    // Update fields
    if (score1 !== undefined) match.score1 = score1;
    if (score2 !== undefined) match.score2 = score2;
    if (status) match.status = status;
    if (description !== undefined) match.description = description;
    if (venue !== undefined) match.venue = venue;

    // If match is being finished, update house scores
    if (status === 'finished' && match.status !== 'finished') {
      const winner = match.score1 > match.score2 ? match.house1 : 
                    match.score2 > match.score1 ? match.house2 : null;
      
      if (winner) {
        // Award points to winning house
        await House.findByIdAndUpdate(winner, {
          $inc: { totalScore: match.points }
        });
      }
    }

    await match.save();
    await match.populate('house1', 'name color');
    await match.populate('house2', 'name color');
    await match.populate('winner', 'name color');
    await match.populate('createdBy', 'name role');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('match-update', match);
      io.to(`house-${match.house1._id}`).emit('match-update', match);
      io.to(`house-${match.house2._id}`).emit('match-update', match);
    }

    res.json({
      message: 'Match updated successfully',
      match
    });
  } catch (error) {
    console.error('Update match error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete match (Admin only)
const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get live matches
const getLiveMatches = async (req, res) => {
  try {
    const matches = await Match.find({ status: 'live' })
      .populate('house1', 'name color')
      .populate('house2', 'name color')
      .populate('winner', 'name color')
      .sort({ matchTime: 1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming matches
const getUpcomingMatches = async (req, res) => {
  try {
    const matches = await Match.find({ 
      status: 'upcoming',
      matchTime: { $gte: new Date() }
    })
      .populate('house1', 'name color')
      .populate('house2', 'name color')
      .sort({ matchTime: 1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get finished matches
const getFinishedMatches = async (req, res) => {
  try {
    const matches = await Match.find({ status: 'finished' })
      .populate('house1', 'name color')
      .populate('house2', 'name color')
      .populate('winner', 'name color')
      .sort({ matchTime: -1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start match (Admin, Score Uploader)
const startMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.status !== 'upcoming') {
      return res.status(400).json({ message: 'Match is not in upcoming status' });
    }

    match.status = 'live';
    await match.save();
    await match.populate('house1', 'name color');
    await match.populate('house2', 'name color');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('match-started', match);
      io.to(`house-${match.house1._id}`).emit('match-started', match);
      io.to(`house-${match.house2._id}`).emit('match-started', match);
    }

    res.json({
      message: 'Match started successfully',
      match
    });
  } catch (error) {
    console.error('Start match error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Finish match (Admin, Score Uploader)
const finishMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.status === 'finished') {
      return res.status(400).json({ message: 'Match is already finished' });
    }

    match.status = 'finished';
    match.finishedAt = new Date();

    // Determine winner and award points
    const winner = match.score1 > match.score2 ? match.house1 : 
                  match.score2 > match.score1 ? match.house2 : null;
    
    if (winner) {
      match.winner = winner;
      await House.findByIdAndUpdate(winner, {
        $inc: { totalScore: match.points }
      });
    }

    await match.save();
    await match.populate('house1', 'name color');
    await match.populate('house2', 'name color');
    await match.populate('winner', 'name color');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('match-finished', match);
      io.to(`house-${match.house1._id}`).emit('match-finished', match);
      io.to(`house-${match.house2._id}`).emit('match-finished', match);
    }

    res.json({
      message: 'Match finished successfully',
      match
    });
  } catch (error) {
    console.error('Finish match error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get match statistics
const getMatchStats = async (req, res) => {
  try {
    const totalMatches = await Match.countDocuments();
    const liveMatches = await Match.countDocuments({ status: 'live' });
    const upcomingMatches = await Match.countDocuments({ status: 'upcoming' });
    const finishedMatches = await Match.countDocuments({ status: 'finished' });

    // Get matches by sport
    const sportStats = await Match.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent matches
    const recentMatches = await Match.find()
      .populate('house1', 'name color')
      .populate('house2', 'name color')
      .populate('winner', 'name color')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalMatches,
      liveMatches,
      upcomingMatches,
      finishedMatches,
      sportStats,
      recentMatches
    });
  } catch (error) {
    console.error('Get match stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
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
};
