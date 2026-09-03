const express = require('express');
const router = express.Router();
const { db } = require('../db');

// List demo users for 1-click quick login
router.get('/demo-users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, title, department, avatar FROM users').all();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // For demo/hackathon prototype, allow simple match or password123
    if (password && password !== user.password && password !== 'password123') {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    const { password: _, ...userSafe } = user;
    res.json({
      success: true,
      token: `demo-jwt-token-${user.id}`,
      user: userSafe
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
