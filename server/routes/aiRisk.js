const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/ai-risk/predict - Heuristic Medication Delay Risk Prediction
router.get('/predict', (req, res) => {
  try {
    const { patientId, medicineName, ward } = req.query;

    // Retrieve ward workload
    const targetWard = ward || 'General Ward';
    const pendingInWard = db.prepare(`
      SELECT COUNT(*) as c FROM medication_schedules ms
      JOIN patients p ON ms.patientId = p.id
      WHERE p.ward = ? AND ms.status IN ('DUE', 'OVERDUE')
    `).get(targetWard).c;

    // Retrieve patient active medicines count
    let activeMedsCount = 2;
    if (patientId) {
      const activeRx = db.prepare(`
        SELECT COUNT(*) as c FROM prescriptions WHERE patientId = ? AND status = 'ACTIVE'
      `).get(patientId);
      if (activeRx) activeMedsCount = activeRx.c;
    }

    // Heuristic Risk Calculation (transparent score breakdown)
    let score = 25; // baseline risk %
    const factors = [];

    // Factor 1: Ward workload
    if (pendingInWard > 5) {
      score += 28;
      factors.push(`High medication workload in ${targetWard} (${pendingInWard} pending doses currently active)`);
    } else if (pendingInWard > 2) {
      score += 15;
      factors.push(`Moderate nursing task density in ${targetWard}`);
    }

    // Factor 2: Polypharmacy / Multi-dose schedule
    if (activeMedsCount >= 3) {
      score += 20;
      factors.push(`Polypharmacy: Patient currently has ${activeMedsCount} active concurrent prescriptions`);
    }

    // Factor 3: Route complexity
    const normalizedMed = (medicineName || '').toLowerCase();
    if (normalizedMed.includes('meropenem') || normalizedMed.includes('furosemide') || normalizedMed.includes('noradrenaline')) {
      score += 18;
      factors.push('IV Infusion protocol requiring precise rate titration and vascular access check');
    }

    // Factor 4: Peak shift hour
    const currentHour = new Date().getHours();
    if ((currentHour >= 8 && currentHour <= 10) || (currentHour >= 18 && currentHour <= 20)) {
      score += 12;
      factors.push('Scheduled during morning/evening peak medication round changeover');
    }

    score = Math.min(94, Math.max(15, score));
    const riskLevel = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

    res.json({
      success: true,
      disclaimer: 'Decision-support prototype — not a clinical decision. Final medical workflow managed by healthcare staff.',
      data: {
        riskScore: score,
        riskLevel,
        riskBadgeColor: riskLevel === 'HIGH' ? 'red' : riskLevel === 'MEDIUM' ? 'amber' : 'green',
        factors,
        recommendation: riskLevel === 'HIGH' 
          ? 'Prioritize patient in upcoming medication round or prepare IV supplies in advance.' 
          : 'Standard medication round scheduling applies.'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
