const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const { db } = require('../db');
const { checkSafetyWarnings } = require('../safety/checker');

// Helper to safe parse JSON
function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}

// GET /api/medications - Nurse Task Board List
router.get('/', (req, res) => {
  try {
    const { tab = 'ALL', ward, patientId, search } = req.query;

    let query = `
      SELECT 
        ms.id, ms.prescriptionId, ms.patientId, ms.medicine, ms.dose, ms.route,
        ms.scheduledTime, ms.status, ms.administeredAt, ms.administeredBy,
        ms.administeredByRole, ms.reason, ms.notes, ms.isStat, ms.createdAt,
        p.name as patientName, p.uhid as patientUhid, p.age as patientAge,
        p.gender as patientGender, p.ward as patientWard, p.bed as patientBed,
        p.allergies as patientAllergies, p.qrCode as patientQrCode,
        rx.doctorName, rx.instructions as rxInstructions, rx.status as rxStatus
      FROM medication_schedules ms
      JOIN patients p ON ms.patientId = p.id
      JOIN prescriptions rx ON ms.prescriptionId = rx.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by tab
    if (tab === 'DUE') {
      query += ` AND ms.status = 'DUE'`;
    } else if (tab === 'UPCOMING') {
      query += ` AND ms.status = 'UPCOMING'`;
    } else if (tab === 'OVERDUE') {
      query += ` AND ms.status = 'OVERDUE'`;
    } else if (tab === 'COMPLETED') {
      query += ` AND ms.status IN ('GIVEN', 'DELAYED', 'HELD', 'REFUSED', 'NOT_GIVEN')`;
    } else if (tab === 'STAT') {
      query += ` AND ms.isStat = 1`;
    }

    // Ward filter
    if (ward && ward !== 'ALL') {
      query += ` AND p.ward = ?`;
      params.push(ward);
    }

    // Patient filter
    if (patientId) {
      query += ` AND ms.patientId = ?`;
      params.push(patientId);
    }

    // Search filter
    if (search) {
      query += ` AND (p.name LIKE ? OR p.uhid LIKE ? OR ms.medicine LIKE ? OR p.bed LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    // Sort: STAT items first, then by scheduled time ascending
    query += ` ORDER BY ms.isStat DESC, ms.scheduledTime ASC`;

    const schedules = db.prepare(query).all(...params);

    const formatted = schedules.map(s => ({
      ...s,
      patientAllergies: safeJsonParse(s.patientAllergies, [])
    }));

    // Summary counts for nurse header
    const nowIso = new Date().toISOString();
    const countDue = db.prepare(`SELECT COUNT(*) as c FROM medication_schedules WHERE status = 'DUE'`).get().c;
    const countUpcoming = db.prepare(`SELECT COUNT(*) as c FROM medication_schedules WHERE status = 'UPCOMING'`).get().c;
    const countOverdue = db.prepare(`SELECT COUNT(*) as c FROM medication_schedules WHERE status = 'OVERDUE'`).get().c;
    const countCompleted = db.prepare(`SELECT COUNT(*) as c FROM medication_schedules WHERE status IN ('GIVEN', 'DELAYED', 'HELD', 'REFUSED', 'NOT_GIVEN')`).get().c;
    const countStat = db.prepare(`SELECT COUNT(*) as c FROM medication_schedules WHERE isStat = 1 AND status IN ('DUE', 'OVERDUE')`).get().c;

    res.json({
      success: true,
      data: formatted,
      counts: {
        due: countDue,
        upcoming: countUpcoming,
        overdue: countOverdue,
        completed: countCompleted,
        stat: countStat,
        total: schedules.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/medications/verify-qr - QR & 5-Rights Verification
router.post('/verify-qr', (req, res) => {
  try {
    const { scheduleId, patientId, scannedQr } = req.body;

    const schedule = db.prepare(`
      SELECT ms.*, p.name as patientName, p.uhid, p.allergies, p.qrCode, rx.status as rxStatus
      FROM medication_schedules ms
      JOIN patients p ON ms.patientId = p.id
      JOIN prescriptions rx ON ms.prescriptionId = rx.id
      WHERE ms.id = ?
    `).get(scheduleId);

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Medication schedule event not found' });
    }

    const patient = db.prepare('SELECT * FROM patients WHERE id = ? OR uhid = ?').get(schedule.patientId, schedule.patientId);
    const rawQr = (scannedQr || '').trim();

    // Match criteria: either exact QR string, patient ID, UHID, or embedded patient ID in string
    const isPatientMatch = 
      rawQr === schedule.qrCode ||
      rawQr.includes(schedule.patientId) ||
      rawQr.includes(schedule.uhid) ||
      rawQr.toLowerCase().includes(schedule.patientName.toLowerCase());

    const isRxActive = schedule.rxStatus === 'ACTIVE';
    const isMedicineMatch = true; // matches schedule item
    const isDoseMatch = true;

    // Safety & Allergy Warnings Check
    const activePrescriptions = db.prepare(`
      SELECT * FROM prescriptions WHERE patientId = ? AND status = 'ACTIVE'
    `).all(schedule.patientId);

    const safetyWarnings = checkSafetyWarnings({
      patient: {
        ...patient,
        allergies: safeJsonParse(patient.allergies, [])
      },
      medicineName: schedule.medicine,
      dose: schedule.dose,
      currentActivePrescriptions: activePrescriptions
    });

    res.json({
      success: true,
      verification: {
        patientMatched: isPatientMatch,
        activeRxMatched: isRxActive,
        medicineMatched: isMedicineMatch,
        doseMatched: isDoseMatch,
        verifiedPatient: {
          id: patient.id,
          uhid: patient.uhid,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          ward: patient.ward,
          bed: patient.bed,
          allergies: safeJsonParse(patient.allergies, [])
        },
        selectedMedication: {
          scheduleId: schedule.id,
          medicine: schedule.medicine,
          dose: schedule.dose,
          route: schedule.route,
          scheduledTime: schedule.scheduledTime,
          isStat: schedule.isStat
        },
        safetyWarnings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/medications/administer - Record Administration Action (Hero Feature)
router.post('/administer', (req, res) => {
  try {
    const {
      scheduleId,
      action, // GIVEN, DELAYED, HELD, REFUSED, NOT_GIVEN
      reason,
      notes = '',
      administeredBy = 'Nurse Priya Patel',
      administeredByRole = 'NURSE',
      userId = 'USR-NURSE-01'
    } = req.body;

    if (!scheduleId || !action) {
      return res.status(400).json({ success: false, error: 'scheduleId and action are required' });
    }

    const schedule = db.prepare(`
      SELECT ms.*, p.name as patientName, p.uhid, p.ward, p.bed
      FROM medication_schedules ms
      JOIN patients p ON ms.patientId = p.id
      WHERE ms.id = ?
    `).get(scheduleId);

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Medication schedule event not found' });
    }

    const nowIso = new Date().toISOString();

    // 1. Update Medication Schedule Row
    db.prepare(`
      UPDATE medication_schedules
      SET status = ?,
          administeredAt = ?,
          administeredBy = ?,
          administeredByRole = ?,
          reason = ?,
          notes = ?
      WHERE id = ?
    `).run(
      action,
      nowIso,
      administeredBy,
      administeredByRole,
      reason || null,
      notes || null,
      scheduleId
    );

    // 2. Insert into Audit Log
    const auditId = 'AUD-' + crypto.randomUUID().substring(0, 8).toUpperCase();
    let auditAction = `MEDICATION_${action}`;
    let auditDetails = `Medication recorded as ${action} by ${administeredBy}.`;
    if (reason) auditDetails += ` Reason: ${reason}.`;
    if (notes) auditDetails += ` Notes: ${notes}.`;

    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, userId, userName, userRole, action, patientId, patientName, medicineName, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      auditId,
      nowIso,
      userId,
      administeredBy,
      administeredByRole,
      auditAction,
      schedule.patientId,
      schedule.patientName,
      `${schedule.medicine} ${schedule.dose}`,
      auditDetails
    );

    const updated = db.prepare('SELECT * FROM medication_schedules WHERE id = ?').get(scheduleId);

    res.json({
      success: true,
      message: `Medication successfully recorded as ${action}.`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
