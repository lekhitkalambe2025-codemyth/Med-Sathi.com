const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const { db } = require('../db');
const { generateScheduleEvents } = require('../scheduler');
const { checkSafetyWarnings } = require('../safety/checker');

// Helper to safe parse JSON
function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    return fallback;
  }
}

// POST /api/prescriptions/preview-schedule - Calculate preview of dosing times without saving
router.post('/preview-schedule', (req, res) => {
  try {
    const { frequency, durationDays, startDate, startTime, isStat, medicine, dose, route } = req.body;
    const dummyRx = {
      id: 'PREVIEW',
      patientId: 'PREVIEW',
      medicine: medicine || 'Selected Drug',
      dose: dose || 'Standard Dose',
      route: route || 'Oral',
      frequency: frequency || 'TDS',
      durationDays: durationDays || 5,
      startDate: startDate || new Date().toISOString().split('T')[0],
      startTime: startTime || '08:00',
      isStat: isStat ? 1 : 0
    };

    const events = generateScheduleEvents(dummyRx);
    res.json({
      success: true,
      totalEvents: events.length,
      events: events.map(e => ({
        scheduledTime: e.scheduledTime,
        status: e.status,
        dose: e.dose,
        route: e.route
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/prescriptions/safety-check - Rule-based allergy & duplicate checker before prescribing
router.post('/safety-check', (req, res) => {
  try {
    const { patientId, medicine, dose } = req.body;
    const patient = db.prepare('SELECT * FROM patients WHERE id = ? OR uhid = ?').get(patientId, patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const activePrescriptions = db.prepare(`
      SELECT * FROM prescriptions WHERE patientId = ? AND status = 'ACTIVE'
    `).all(patientId);

    const warnings = checkSafetyWarnings({
      patient: {
        ...patient,
        allergies: safeJsonParse(patient.allergies, [])
      },
      medicineName: medicine,
      dose,
      currentActivePrescriptions: activePrescriptions
    });

    res.json({ success: true, warnings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/prescriptions - Create Prescription & Automatically Generate Schedule
router.post('/', (req, res) => {
  try {
    const {
      patientId,
      doctorId = 'USR-DOC-01',
      doctorName = 'Dr. Rajesh Sharma',
      medicine,
      dose,
      route = 'Oral',
      frequency = 'TDS',
      durationDays = 5,
      startDate,
      startTime = '08:00',
      instructions = '',
      isStat = 0
    } = req.body;

    if (!patientId || !medicine || !dose) {
      return res.status(400).json({ success: false, error: 'Patient, Medicine and Dose are required.' });
    }

    const patient = db.prepare('SELECT * FROM patients WHERE id = ? OR uhid = ?').get(patientId, patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found.' });
    }

    const rxId = 'RX-' + crypto.randomUUID().substring(0, 6).toUpperCase();
    const nowIso = new Date().toISOString();
    const startDt = startDate || nowIso.split('T')[0];

    const isStatNumeric = (isStat === true || isStat === 1 || frequency === 'STAT') ? 1 : 0;

    // 1. Insert Prescription
    const insertRx = db.prepare(`
      INSERT INTO prescriptions (
        id, patientId, doctorId, doctorName, medicine, dose, route,
        frequency, durationDays, startDate, startTime, instructions,
        isStat, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    `);

    insertRx.run(
      rxId, patientId, doctorId, doctorName, medicine, dose, route,
      frequency, parseInt(durationDays, 10) || 1, startDt, startTime, instructions,
      isStatNumeric, nowIso, nowIso
    );

    // 2. Generate Automated Medication Schedule
    const newRx = {
      id: rxId,
      patientId,
      medicine,
      dose,
      route,
      frequency,
      durationDays: parseInt(durationDays, 10) || 1,
      startDate: startDt,
      startTime,
      isStat: isStatNumeric
    };

    const scheduleEvents = generateScheduleEvents(newRx);
    const insertSched = db.prepare(`
      INSERT INTO medication_schedules (
        id, prescriptionId, patientId, medicine, dose, route,
        scheduledTime, status, isStat, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const evt of scheduleEvents) {
      insertSched.run(
        evt.id, evt.prescriptionId, evt.patientId, evt.medicine, evt.dose,
        evt.route, evt.scheduledTime, evt.status, evt.isStat, evt.createdAt
      );
    }

    // 3. Create Audit Log Entry
    const auditId = 'AUD-' + crypto.randomUUID().substring(0, 8).toUpperCase();
    const auditAction = isStatNumeric ? 'STAT_ORDER_ISSUED' : 'PRESCRIPTION_CREATED';
    const auditDetails = isStatNumeric
      ? `STAT emergency order created for ${medicine} (${dose}, ${route}). 1 immediate schedule event generated.`
      : `Created prescription: ${medicine} ${dose} via ${route}, ${frequency} for ${durationDays} days. ${scheduleEvents.length} schedule events automatically generated.`;

    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, userId, userName, userRole, action, patientId, patientName, medicineName, details)
      VALUES (?, ?, ?, ?, 'DOCTOR', ?, ?, ?, ?, ?)
    `).run(auditId, nowIso, doctorId, doctorName, auditAction, patient.id, patient.name, `${medicine} ${dose}`, auditDetails);

    res.json({
      success: true,
      message: `Prescription saved and ${scheduleEvents.length} medication schedule events generated.`,
      data: {
        prescription: newRx,
        scheduleCount: scheduleEvents.length,
        scheduleEvents
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/prescriptions/:id/stop - Stop prescription with clinical reason & preserve history
router.post('/:id/stop', (req, res) => {
  try {
    const { stoppedReason = 'Clinical review / Course completed', stoppedBy = 'Dr. Rajesh Sharma', userId = 'USR-DOC-01' } = req.body;
    const rx = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(req.params.id);
    if (!rx) {
      return res.status(404).json({ success: false, error: 'Prescription not found' });
    }

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(rx.patientId);
    const nowIso = new Date().toISOString();

    // 1. Update prescription status to STOPPED
    db.prepare(`
      UPDATE prescriptions 
      SET status = 'STOPPED', stoppedReason = ?, stoppedBy = ?, stoppedAt = ?, updatedAt = ?
      WHERE id = ?
    `).run(stoppedReason, stoppedBy, nowIso, nowIso, rx.id);

    // 2. Mark remaining DUE/UPCOMING schedule events as NOT_GIVEN (Prescription Stopped)
    db.prepare(`
      UPDATE medication_schedules
      SET status = 'NOT_GIVEN', reason = ?, notes = 'Prescription stopped by physician'
      WHERE prescriptionId = ? AND status IN ('DUE', 'UPCOMING', 'OVERDUE')
    `).run(`Discontinued by Doctor: ${stoppedReason}`, rx.id);

    // 3. Traceable Audit Log
    const auditId = 'AUD-' + crypto.randomUUID().substring(0, 8).toUpperCase();
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, userId, userName, userRole, action, patientId, patientName, medicineName, details)
      VALUES (?, ?, ?, ?, 'DOCTOR', 'PRESCRIPTION_STOPPED', ?, ?, ?, ?)
    `).run(
      auditId, nowIso, userId, stoppedBy, patient ? patient.id : rx.patientId,
      patient ? patient.name : 'Unknown Patient', `${rx.medicine} ${rx.dose}`,
      `Prescription stopped. Rationale: ${stoppedReason}`
    );

    res.json({
      success: true,
      message: `Prescription ${rx.id} stopped. Remaining scheduled doses discontinued.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/prescriptions/:id - Edit Prescription (Dose / Frequency change)
router.put('/:id', (req, res) => {
  try {
    const { dose, frequency, instructions, updatedBy = 'Dr. Rajesh Sharma', userId = 'USR-DOC-01' } = req.body;
    const rx = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(req.params.id);
    if (!rx) {
      return res.status(404).json({ success: false, error: 'Prescription not found' });
    }

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(rx.patientId);
    const nowIso = new Date().toISOString();

    const oldDetails = `Old: ${rx.dose}, ${rx.frequency}`;
    const newDetails = `New: ${dose || rx.dose}, ${frequency || rx.frequency}`;

    db.prepare(`
      UPDATE prescriptions
      SET dose = COALESCE(?, dose),
          frequency = COALESCE(?, frequency),
          instructions = COALESCE(?, instructions),
          status = 'MODIFIED',
          updatedAt = ?
      WHERE id = ?
    `).run(dose, frequency, instructions, nowIso, rx.id);

    // Update upcoming schedule items dose
    if (dose) {
      db.prepare(`
        UPDATE medication_schedules
        SET dose = ?
        WHERE prescriptionId = ? AND status IN ('DUE', 'UPCOMING')
      `).run(dose, rx.id);
    }

    // Traceable Audit Log
    const auditId = 'AUD-' + crypto.randomUUID().substring(0, 8).toUpperCase();
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, userId, userName, userRole, action, patientId, patientName, medicineName, details)
      VALUES (?, ?, ?, ?, 'DOCTOR', 'PRESCRIPTION_MODIFIED', ?, ?, ?, ?)
    `).run(
      auditId, nowIso, userId, updatedBy, patient ? patient.id : rx.patientId,
      patient ? patient.name : 'Unknown Patient', rx.medicine,
      `Prescription modified. ${oldDetails} → ${newDetails}. Reason: Clinical adjustment.`
    );

    res.json({
      success: true,
      message: 'Prescription updated successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
