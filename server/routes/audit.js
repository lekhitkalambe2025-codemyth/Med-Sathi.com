const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/audit - List audit logs with filters
router.get('/', (req, res) => {
  try {
    const { role, action, search, limit = 100 } = req.query;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (role && role !== 'ALL') {
      query += ' AND userRole = ?';
      params.push(role);
    }

    if (action && action !== 'ALL') {
      query += ' AND action LIKE ?';
      params.push(`%${action}%`);
    }

    if (search) {
      query += ' AND (userName LIKE ? OR patientName LIKE ? OR medicineName LIKE ? OR details LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit, 10) || 100);

    const logs = db.prepare(query).all(...params);

    res.json({
      success: true,
      total: logs.length,
      data: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
