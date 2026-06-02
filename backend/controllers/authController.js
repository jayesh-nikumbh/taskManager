const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const sendEmail = require('../utils/sendEmail');

/**
 * Helper: Generates a JWT token for a user
 * @param {Object} user - User document from MongoDB
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * ✅ POST /api/auth/register
 * Description: Registers a new user account
 */
const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Input Validation
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    // Encrypt Password
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User Record
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
};

/**
 * ✅ POST /api/auth/login
 * Description: Authenticates user and returns a session token
 */
const login = async (req, res) => {
  const { identifier, password } = req.body;
  console.log(`🔑 Login attempt for: ${identifier}`);

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Username/Email and password are required' });
  }

  try {
    // Find user by either email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please register first.' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.username}! 🎉`,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
};

/**
 * ✅ GET /api/auth/me
 * Description: Returns details of the currently logged-in user
 */
const getMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving user info', error: err.message });
  }
};

/**
 * ✅ GET /api/auth/users
 * Description: Returns a list of all users (Admin Restricted)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users', error: err.message });
  }
};

/**
 * ✅ DELETE /api/auth/users/:id
 * Description: Deletes a user by ID (Admin Restricted)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete operation failed', error: err.message });
  }
};

/**
 * ✅ PUT /api/auth/users/:id
 * Description: Updates user details (Admin Restricted)
 */
const updateUser = async (req, res) => {
  const { username, email, role, password } = req.body;
  try {
    const updateData = { username, email, role };
    
    // Only update password if provided
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(8);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const oldUser = await User.findById(req.params.id);
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Sync tasks with updated user info
    await Task.updateMany(
      { userEmail: oldUser.email },
      { userName: user.username, userEmail: user.email }
    );

    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed', error: err.message });
  }
};

/**
 * ✅ PUT /api/auth/me
 * Description: Allows a user to update their own profile
 */
const updateMe = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const updateData = { username, email };
    
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(8);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    const oldUser = await User.findById(userId);
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    // Sync tasks with updated user info
    await Task.updateMany(
      { userEmail: oldUser.email },
      { userName: user.username, userEmail: user.email }
    );

    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Profile update failed', error: err.message });
  }
};

/**
 * ✅ POST /api/auth/forgot-password
 * Description: Sends a password reset link to the user's email
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email address.' });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set expiry (10 minutes)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    // HTML Message for email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
        <p>You are receiving this email because you (or someone else) have requested the reset of a password for your account.</p>
        <p>Please click on the button below to reset your password. This link is valid for 10 minutes:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">Task Manager System &copy; 2024</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message: message,
      });

      res.status(200).json({ 
        success: true, 
        message: 'Password reset link has been sent to your registered email address.' 
      });
    } catch (err) {
      console.error('Email Delivery Error:', err.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: `Email could not be sent. Error: ${err.message}` });
    }
  } catch (err) {
    console.error('Forgot Password Process Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error during forgot password process' });
  }
};

/**
 * ✅ PUT /api/auth/reset-password/:token
 * Description: Verifies token and updates user's password
 */
const resetPassword = async (req, res) => {
  const { password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
    }

    // Hash and update the new password
    const salt = await bcrypt.genSalt(8);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Your password has been successfully updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset password', error: err.message });
  }
};

module.exports = { register, login, getMe, getAllUsers, deleteUser, updateUser, updateMe, forgotPassword, resetPassword };
