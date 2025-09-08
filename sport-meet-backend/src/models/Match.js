const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  house1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
    required: true
  },
  house2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
    required: true
  },
  score1: { 
    type: Number, 
    default: 0,
    min: 0
  },
  score2: { 
    type: Number, 
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ["upcoming", "live", "finished"],
    default: "upcoming",
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House'
  },
  matchTime: {
    type: Date,
    required: true
  },
  sport: {
    type: String,
    required: true,
    trim: true,
    enum: ['Football', 'Basketball', 'Cricket', 'Volleyball', 'Tennis', 'Badminton', 'Athletics', 'Swimming', 'Other']
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  venue: {
    type: String,
    trim: true,
    maxlength: 100
  },
  points: {
    type: Number,
    default: 10 // Points awarded to winner
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  finishedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
matchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set finishedAt when status changes to finished
  if (this.isModified('status') && this.status === 'finished') {
    this.finishedAt = new Date();
  }
  
  // Determine winner when scores are updated
  if (this.isModified('score1') || this.isModified('score2')) {
    if (this.score1 > this.score2) {
      this.winner = this.house1;
    } else if (this.score2 > this.score1) {
      this.winner = this.house2;
    } else {
      this.winner = null; // Draw
    }
  }
  
  next();
});

module.exports = mongoose.model("Match", matchSchema);
