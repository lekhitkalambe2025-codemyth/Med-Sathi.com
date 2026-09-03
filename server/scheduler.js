/**
 * SmartMedChart Clinical Medication Scheduler Engine
 * Generates structured, precise medication schedule events from prescriptions
 */
const crypto = require('crypto');

function getFrequencyTimeOffsets(frequency) {
  const normalized = (frequency || '').toLowerCase().trim();

  if (normalized.includes('stat') || normalized.includes('immediate') || normalized.includes('once only')) {
    return ['00:00'];
  }

  if (normalized.includes('once daily') || normalized === 'od' || normalized === 'qd') {
    return ['08:00'];
  }

  if (normalized.includes('twice daily') || normalized.includes('2 times') || normalized === 'bd' || normalized === 'bid') {
    return ['08:00', '20:00'];
  }

  if (normalized.includes('3 times') || normalized.includes('three times') || normalized === 'tds' || normalized === 'tid') {
    return ['08:00', '14:00', '20:00'];
  }

  if (normalized.includes('4 times') || normalized.includes('four times') || normalized === 'qds' || normalized === 'qid') {
    return ['06:00', '12:00', '18:00', '22:00'];
  }

  if (normalized.includes('every 4 hours') || normalized === 'q4h') {
    return ['04:00', '08:00', '12:00', '16:00', '20:00', '00:00'];
  }

  if (normalized.includes('every 6 hours') || normalized === 'q6h') {
    return ['06:00', '12:00', '18:00', '00:00'];
  }

  if (normalized.includes('every 8 hours') || normalized === 'q8h') {
    return ['06:00', '14:00', '22:00'];
  }

  if (normalized.includes('at bedtime') || normalized.includes('hs') || normalized.includes('night')) {
    return ['21:00'];
  }

  if (normalized.includes('prn') || normalized.includes('as needed')) {
    return ['08:00'];
  }

  return ['08:00'];
}

function calculateDelayRisk(medicationName, route, isStat, frequency) {
  let score = 15;
  const med = (medicationName || '').toLowerCase();
  const r = (route || '').toLowerCase();

  if (isStat) score += 45;
  if (r.includes('iv') || r.includes('infusion')) score += 20;
  if (r.includes('subcutaneous') || r.includes('injection')) score += 15;
  if (med.includes('insulin') || med.includes('heparin') || med.includes('potassium')) score += 25;
  if (frequency && (frequency.includes('4') || frequency.includes('Q4H'))) score += 15;

  score = Math.min(score, 95);
  const level = score >= 60 ? 'HIGH' : score >= 35 ? 'MODERATE' : 'LOW';
  return { score, level };
}

function generateScheduleEvents(prescription) {
  const events = [];
  const duration = parseInt(prescription.durationDays || prescription.duration_days, 10) || 1;
  const startDateStr = prescription.startDate || prescription.start_date || new Date().toISOString().split('T')[0];
  const startTimeStr = prescription.startTime || prescription.start_time || '08:00';
  const isStat = (prescription.isStat === 1 || prescription.is_stat === 1 || prescription.frequency === 'STAT') ? 1 : 0;
  const nowIso = new Date().toISOString();

  if (isStat) {
    const risk = calculateDelayRisk(prescription.medicine, prescription.route, 1, 'STAT');
    events.push({
      id: 'SCH-' + crypto.randomUUID().substring(0, 8).toUpperCase(),
      prescriptionId: prescription.id,
      patientId: prescription.patientId,
      medicine: prescription.medicine,
      dose: prescription.dose,
      route: prescription.route || 'Oral',
      scheduledTime: `${startDateStr}T${startTimeStr.length === 5 ? startTimeStr + ':00.000Z' : startTimeStr}`,
      status: 'DUE',
      isStat: 1,
      riskScore: risk.score,
      riskLevel: risk.level,
      createdAt: nowIso
    });
    return events;
  }

  const times = getFrequencyTimeOffsets(prescription.frequency);
  const startDate = new Date(startDateStr);

  for (let d = 0; d < duration; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + d);
    const dateFormatted = currentDate.toISOString().split('T')[0];

    for (const time of times) {
      const risk = calculateDelayRisk(prescription.medicine, prescription.route, 0, prescription.frequency);
      events.push({
        id: 'SCH-' + crypto.randomUUID().substring(0, 8).toUpperCase(),
        prescriptionId: prescription.id,
        patientId: prescription.patientId,
        medicine: prescription.medicine,
        dose: prescription.dose,
        route: prescription.route || 'Oral',
        scheduledTime: `${dateFormatted}T${time}:00.000Z`,
        status: 'DUE',
        isStat: 0,
        riskScore: risk.score,
        riskLevel: risk.level,
        createdAt: nowIso
      });
    }
  }

  return events;
}

module.exports = {
  generateScheduleEvents,
  getFrequencyTimeOffsets,
  calculateDelayRisk
};
