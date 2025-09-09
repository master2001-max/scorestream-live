
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const House = require('../models/House');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Force view-only role on self-registration
    const forcedRole = 'student';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: forcedRole,
      house: null
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Populate house data for response
    const populatedUser = await User.findById(user._id).populate('house', 'name color');

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        house: populatedUser.house
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email }).populate('house', 'name color');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        house: user.house
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('house', 'name color totalScore');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user profile (name, house)
const updateProfile = async (req, res) => {
  try {
    const { name, house } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name;
    if (house) {
      // Validate house exists
      const houseDoc = await House.findById(house);
      if (!houseDoc) {
        return res.status(400).json({ message: 'Invalid house ID' });
      }
      updateData.house = house;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('house', 'name color');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: create user with role (score_uploader, captain, student)
const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, house } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }
    if (!['score_uploader', 'captain', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (role === 'captain' && !house) {
      return res.status(400).json({ message: 'Captain must be assigned a house' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    let houseRef = null;
    if (house) {
      const houseDoc = await House.findById(house);
      if (!houseDoc) return res.status(400).json({ message: 'Invalid house ID' });
      houseRef = houseDoc._id;
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const created = await User.create({ name, email, password: hashed, role, house: houseRef });
    res.status(201).json({
      message: 'User created',
      user: { id: created._id, name: created.name, email: created.email, role: created.role, house: created.house }
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: update user (role, house, isActive). Email immutable for non-admin roles
const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, house, isActive, password } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (role && ['admin', 'score_uploader', 'captain', 'student', 'guest'].includes(role)) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (house !== undefined) {
      if (house) {
        const houseDoc = await House.findById(house);
        if (!houseDoc) return res.status(400).json({ message: 'Invalid house ID' });
        user.house = houseDoc._id;
      } else {
        user.house = null;
      }
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    res.json({ message: 'User updated', user: { id: user._id, name: user.name, email: user.email, role: user.role, house: user.house, isActive: user.isActive } });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: list users
const adminListUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('house', 'name color');
    res.json(users);
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, adminCreateUser, adminUpdateUser, adminListUsers };
