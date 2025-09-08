const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  color: {
    type: String,
    required: true,
    trim: true,
    match: /^#[0-9A-F]{6}$/i // Hex color validation
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  motto: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  isActive: {
    type: Boolean,
    default: true
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
houseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("House", houseSchema);
