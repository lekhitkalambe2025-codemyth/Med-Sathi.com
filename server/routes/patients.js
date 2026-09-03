const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Helper to safely parse JSON
function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}

// GET /api/patients - List patients with filters and live active Rx counts
router.get('/', (req, res) => {
  try {
    const { ward, search } = req.query;
    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (ward && ward !== 'ALL') {
      query += ' AND ward = ?';
      params.push(ward);
    }

    if (search) {
      query += ' AND (name LIKE ? OR uhid LIKE ? OR bed LIKE ? OR id LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY ward ASC, bed ASC';
    const patients = db.prepare(query).all(...params);

    // Enhance each patient with active prescription counts & pending STAT flags
    const enhanced = patients.map(p => {
      const activeRx = db.prepare(`
        SELECT COUNT(*) as count FROM prescriptions 
        WHERE patientId = ? AND status = 'ACTIVE'
      `).get(p.id);

      const pendingStat = db.prepare(`
        SELECT COUNT(*) as count FROM medication_schedules
        WHERE patientId = ? AND isStat = 1 AND status IN ('DUE', 'OVERDUE')
      `).get(p.id);

      const dueToday = db.prepare(`
        SELECT COUNT(*) as count FROM medication_schedules
        WHERE patientId = ? AND status IN ('DUE', 'OVERDUE', 'UPCOMING')
      `).get(p.id);

      return {
        ...p,
        allergies: safeJsonParse(p.allergies, []),
        medicalHistory: safeJsonParse(p.medicalHistory, []),
        vitals: safeJsonParse(p.vitals, {}),
        activePrescriptionsCount: activeRx ? activeRx.count : 0,
        hasPendingStat: pendingStat ? pendingStat.count > 0 : false,
        dueCount: dueToday ? dueToday.count : 0
      };
    });

    res.json({ success: true, data: enhanced });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/patients/:id - Full patient profile
router.get('/:id', (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ? OR uhid = ?').get(req.params.id, req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const parsedPatient = {
      ...patient,
      allergies: safeJsonParse(patient.allergies, []),
      medicalHistory: safeJsonParse(patient.medicalHistory, []),
      vitals: safeJsonParse(patient.vitals, {})
    };

    // Active & stopped prescriptions
    const prescriptions = db.prepare(`
      SELECT * FROM prescriptions 
      WHERE patientId = ? 
      ORDER BY createdAt DESC
    `).all(patient.id);

    // Medication administration timeline (recent scheduled and administered events)
    const medicationEvents = db.prepare(`
      SELECT ms.*, p.doctorName
      FROM medication_schedules ms
      JOIN prescriptions p ON ms.prescriptionId = p.id
      WHERE ms.patientId = ?
      ORDER BY ms.scheduledTime ASC
    `).all(patient.id);

    res.json({
      success: true,
      data: {
        patient: parsedPatient,
        prescriptions,
        medicationTimeline: medicationEvents
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
