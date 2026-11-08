const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fallback_dev_secret_galo_travel';
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    secret,
    { expiresIn: '7d' }
  );
};

/**
 * Admin Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Check if user exists
    let user = await User.findOne({ 
      $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }] 
    });

    // Development auto-seeding if no users exist
    if (!user && (username === 'admin' || username === 'admin@galotravel.com') && password === 'admin123') {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        user = new User({
          username: 'admin',
          email: 'admin@galotravel.com',
          password: 'admin123',
          role: 'admin'
        });
        await user.save();
        console.log('🌱 Seeded initial default admin account: admin / admin123');
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

/**
 * Register Admin/Staff User (Protected)
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with that email or username.'
      });
    }

    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: role || 'admin'
    });

    await user.save();
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user.'
    });
  }
};

module.exports = {
  login,
  register
};
