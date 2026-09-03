const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/pharmacy/inventory - List stock with reorder warnings
router.get('/inventory', (req, res) => {
  try {
    const stock = db.prepare('SELECT * FROM pharmacy_stock ORDER BY category ASC, medicine ASC').all();
    res.json({ success: true, data: stock });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/pharmacy/orders - Active hospital medication requirements generated from active prescriptions
router.get('/orders', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT 
        rx.id as prescriptionId,
        rx.medicine,
        rx.dose,
        rx.route,
        rx.frequency,
        rx.durationDays,
        rx.doctorName,
        rx.createdAt,
        p.id as patientId,
        p.name as patientName,
        p.ward,
        p.bed,
        COUNT(ms.id) as totalDoses,
        SUM(CASE WHEN ms.status = 'GIVEN' THEN 1 ELSE 0 END) as dispensedDoses
      FROM prescriptions rx
      JOIN patients p ON rx.patientId = p.id
      LEFT JOIN medication_schedules ms ON rx.id = ms.prescriptionId
      WHERE rx.status = 'ACTIVE'
      GROUP BY rx.id
      ORDER BY rx.createdAt DESC
    `).all();

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
