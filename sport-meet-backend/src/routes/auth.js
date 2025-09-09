const express = require('express');
const { register, login, getMe, updateProfile, changePassword, adminCreateUser, adminUpdateUser, adminListUsers } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
// Admin management endpoints
router.post('/admin/users', auth, (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Forbidden' }), adminCreateUser);
router.put('/admin/users/:id', auth, (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Forbidden' }), adminUpdateUser);
router.get('/admin/users', auth, (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Forbidden' }), adminListUsers);

module.exports = router;
