const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        // Get user from the token
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
          return res.status(401).json({ error: 'Not authorized, user not found' });
        }

        next();
      } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(401).json({ error: 'Not authorized, token failed' });
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Not authorized, no token' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Admin-only middleware
 * Must be used after authenticate middleware
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.user.familyId) {
      return res.status(403).json({ error: 'No family associated' });
    }

    const { Family } = require('../models');
    const family = await Family.findById(req.user.familyId);

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const memberEntry = family.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!memberEntry || memberEntry.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.family = family;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Family member middleware
 * Ensures user belongs to a family
 */
const requireFamily = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.user.familyId) {
      return res.status(403).json({ error: 'You must join or create a family first' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Family check failed' });
  }
};

module.exports = { authenticate, requireAdmin, requireFamily };
