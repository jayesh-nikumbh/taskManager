const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers, deleteUser, updateUser, updateMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register  → Naya account banao
// POST /api/auth/login     → Login karo (email ya username se)
// GET  /api/auth/me        → Apni info dekho (token chahiye)

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/users', protect, getAllUsers);
router.put('/users/:id', protect, updateUser);
router.delete('/users/:id', protect, deleteUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;

