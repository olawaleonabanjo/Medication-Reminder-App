import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 */
export const signUp = async (req, res) => {
  try {
    console.log("Register body:", req.body);


    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN || '7d',
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error('SignUp Error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 */
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN || '7d',
    });

    return res.status(200).json({
      success: true,
      message: 'User signed in successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error('SignIn Error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 */
export const signOut = async (req, res) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'User signed out successfully',
    });
  } catch (error) {
    console.error('SignOut Error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error("getMe Error:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

