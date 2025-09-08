const Match = require('../models/Match');

// Update scores for a match, emit realtime update
const updateScores = async (req, res) => {
  try {
    const { score1, score2 } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.status === 'finished') {
      return res.status(400).json({ message: 'Cannot update a finished match' });
    }

    if (score1 !== undefined) {
      if (score1 < 0) return res.status(400).json({ message: 'score1 cannot be negative' });
      match.score1 = score1;
    }
    if (score2 !== undefined) {
      if (score2 < 0) return res.status(400).json({ message: 'score2 cannot be negative' });
      match.score2 = score2;
    }

    await match.save();
    await match.populate('house1', 'name color');
    await match.populate('house2', 'name color');
    await match.populate('winner', 'name color');

    const io = req.app.get('io');
    if (io) {
      io.emit('match-update', match);
      io.to(`house-${match.house1._id}`).emit('match-update', match);
      io.to(`house-${match.house2._id}`).emit('match-update', match);
    }

    res.json({ message: 'Scores updated', match });
  } catch (error) {
    console.error('Update scores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { updateScores };


