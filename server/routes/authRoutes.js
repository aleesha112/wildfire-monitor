const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const User = require('../models/User');

const router = express.Router();

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters, with at least 1 uppercase letter and 1 number.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken
    });
    await newUser.save();

    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
    await sendVerificationEmail(email, name, verifyUrl);

    res.status(201).json({
      message: 'Signup successful! Please check your email to verify your account before logging in.'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in. Check your inbox.' });
    }

    // Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// VERIFY EMAIL
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// FORGOT PASSWORD - request reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success even if user not found, to avoid leaking which emails are registered
    if (!user) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, user.name, resetUrl);

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// RESET PASSWORD - set new password using token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters, with at least 1 uppercase letter and 1 number.' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Reset link is invalid or has expired.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;