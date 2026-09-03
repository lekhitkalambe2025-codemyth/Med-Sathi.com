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

// Register / Add new doctor, nurse, or staff
router.post('/register', (req, res) => {
  const { name, email, password, role, title, department } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, error: 'Name, email, and role are required.' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A staff member with this email already exists.' });
    }

    const id = `usr-${role.toLowerCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST';

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, title, department, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      email,
      password || 'password123',
      role.toUpperCase(),
      title || (role === 'DOCTOR' ? 'Attending Physician' : role === 'NURSE' ? 'Staff Nurse' : role === 'PHARMACIST' ? 'Clinical Pharmacist' : 'Hospital Administrator'),
      department || 'Inpatient General Ward',
      initials
    );

    const newUser = db.prepare('SELECT id, name, email, role, title, department, avatar FROM users WHERE id = ?').get(id);
    res.json({
      success: true,
      token: `demo-jwt-token-${newUser.id}`,
      user: newUser
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
