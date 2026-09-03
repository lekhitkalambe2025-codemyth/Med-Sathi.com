import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Pill, AlertTriangle, Clock, Calendar, Check, Stethoscope, 
  Sparkles, Info, ShieldAlert 
} from 'lucide-react';

const COMMON_MEDICINES = [
  { name: 'Paracetamol', defaultDose: '500 mg', defaultRoute: 'Oral', defaultFreq: 'TDS' },
  { name: 'Amoxicillin', defaultDose: '500 mg', defaultRoute: 'Oral', defaultFreq: 'TDS' }, // Penicillin class (triggers allergy check)
  { name: 'Pantoprazole', defaultDose: '40 mg', defaultRoute: 'Oral', defaultFreq: 'OD' },
  { name: 'Metformin', defaultDose: '500 mg', defaultRoute: 'Oral', defaultFreq: 'BD' },
  { name: 'Ondansetron', defaultDose: '4 mg', defaultRoute: 'IV', defaultFreq: 'STAT' },
  { name: 'Ceftriaxone', defaultDose: '1 g', defaultRoute: 'IV', defaultFreq: 'BD' },
  { name: 'Furosemide', defaultDose: '40 mg', defaultRoute: 'IV', defaultFreq: 'BD' },
  { name: 'Bisoprolol', defaultDose: '2.5 mg', defaultRoute: 'Oral', defaultFreq: 'OD' },
  { name: 'Meropenem', defaultDose: '1 g', defaultRoute: 'IV', defaultFreq: 'TDS' },
  { name: 'Ibuprofen', defaultDose: '400 mg', defaultRoute: 'Oral', defaultFreq: 'BD' },
];

export function CreatePrescriptionModal({ isOpen, onClose, patient, onSuccess }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [medicine, setMedicine] = useState('Paracetamol');
  const [dose, setDose] = useState('500 mg');
  const [route, setRoute] = useState('Oral');
  const [frequency, setFrequency] = useState('TDS');
  const [durationDays, setDurationDays] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [instructions, setInstructions] = useState('Take after meals with plenty of water.');
  const [isStat, setIsStat] = useState(false);

  const [safetyWarnings, setSafetyWarnings] = useState([]);
  const [previewSchedule, setPreviewSchedule] = useState({ totalEvents: 15, events: [] });
  const [submitting, setSubmitting] = useState(false);

  // When medicine changes, update defaults and check safety
  const handleSelectMed = (med) => {
    setMedicine(med.name);
    setDose(med.defaultDose);
    setRoute(med.defaultRoute);
    setFrequency(med.defaultFreq);
    if (med.defaultFreq === 'STAT') {
      setIsStat(true);
      setDurationDays(1);
    } else {
      setIsStat(false);
      setDurationDays(5);
    }
  };

  // Live Safety Check & Schedule Preview calculation
  useEffect(() => {
    if (!isOpen || !patient) return;

    // 1. Safety Check
    api.prescriptions.safetyCheck({
      patientId: patient.id,
      medicine,
      dose
    })
      .then(res => setSafetyWarnings(res.warnings || []))
      .catch(() => setSafetyWarnings([]));

    // 2. Schedule Calculation Preview
    api.prescriptions.previewSchedule({
      medicine,
      dose,
      route,
      frequency,
      durationDays: isStat ? 1 : durationDays,
      startDate,
      startTime,
      isStat
    })
      .then(res => setPreviewSchedule(res))
      .catch(() => setPreviewSchedule({ totalEvents: 0, events: [] }));

  }, [isOpen, patient, medicine, dose, route, frequency, durationDays, startDate, startTime, isStat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicine || !dose) {
      showToast('Please enter both medicine and dose', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientId: patient.id,
        doctorId: currentUser?.id || 'USR-DOC-01',
        doctorName: currentUser?.name || 'Dr. Rajesh Sharma',
        medicine,
        dose,
        route,
        frequency: isStat ? 'STAT' : frequency,
        durationDays: isStat ? 1 : parseInt(durationDays, 10),
        startDate,
        startTime,
        instructions,
        isStat: isStat ? 1 : 0
      };

      const res = await api.prescriptions.create(payload);
      showToast(res.message || 'Prescription saved & schedule generated', 'success', 'Prescription Created');
      onSuccess && onSuccess(res.data);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create prescription', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Prescription & Auto-Generate Drug Chart" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Patient Reference Header */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Target Patient</span>
            <h4 className="text-sm font-bold text-slate-800">{patient.name} ({patient.id})</h4>
            <p className="text-xs text-slate-500">Ward: {patient.ward} • Bed: {patient.bed} • Age: {patient.age}y</p>
          </div>
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-rose-500 block">Documented Allergies</span>
              <div className="flex gap-1 justify-end mt-0.5">
                {patient.allergies.map((a, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                    ⚠ {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Common Meds Pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Quick Formulary Presets (Click to Load)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_MEDICINES.map((m, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectMed(m)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  medicine === m.name
                    ? 'bg-brand-600 text-white border-brand-600 font-semibold shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medicine Name *
            </label>
            <input
              type="text"
              required
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
              placeholder="e.g. Paracetamol"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dose *
            </label>
            <input
              type="text"
              required
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="e.g. 500 mg"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Route *
            </label>
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="Oral">Oral (PO)</option>
              <option value="IV">Intravenous (IV)</option>
              <option value="IM">Intramuscular (IM)</option>
              <option value="SC">Subcutaneous (SC)</option>
              <option value="Inhalation">Inhalation (Neb)</option>
              <option value="Topical">Topical</option>
            </select>
          </div>

        </div>

        {/* Frequency & Duration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Frequency *
            </label>
            <select
              value={frequency}
              onChange={(e) => {
                setFrequency(e.target.value);
                if (e.target.value === 'STAT') {
                  setIsStat(true);
                  setDurationDays(1);
                }
              }}
              disabled={isStat}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
            >
              <option value="TDS">TDS (3 times/day)</option>
              <option value="BD">BD (2 times/day)</option>
              <option value="OD">OD (Once daily)</option>
              <option value="QID">QID (4 times/day)</option>
              <option value="Q4H">Q4H (Every 4 hours)</option>
              <option value="Q6H">Q6H (Every 6 hours)</option>
              <option value="Q8H">Q8H (Every 8 hours)</option>
              <option value="PRN">PRN / SOS (As needed)</option>
              <option value="STAT">STAT (1 immediate dose)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              disabled={isStat}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              First Dose Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

        </div>

        {/* STAT Checkbox */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200">
          <input
            type="checkbox"
            id="statCheck"
            checked={isStat}
            onChange={(e) => {
              setIsStat(e.target.checked);
              if (e.target.checked) {
                setFrequency('STAT');
                setDurationDays(1);
              } else {
                setFrequency('TDS');
                setDurationDays(5);
              }
            }}
            className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
          />
          <label htmlFor="statCheck" className="text-xs font-bold text-purple-900 cursor-pointer flex items-center gap-1.5">
            <span>⚡ Mark as STAT Order (Urgent Emergency Administration)</span>
          </label>
        </div>

        {/* Clinical Instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Instructions & Administration Notes
          </label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Give 30 mins before food, monitor BP"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Clinical Safety Warnings Banner (Hero Feature) */}
        {safetyWarnings && safetyWarnings.length > 0 && (
          <div className="space-y-2">
            {safetyWarnings.map((w, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <span className="font-bold block text-amber-950 mb-0.5">{w.title}</span>
                  <p className="text-amber-800 leading-snug">{w.message}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                    Clinical Advice: {w.actionRequired}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Auto-Schedule Event Generation Preview (Hero Feature) */}
        <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 text-sky-950">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold flex items-center gap-1.5 text-sky-900">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Automatic Schedule Engine Preview
            </span>
            <span className="text-xs font-extrabold bg-sky-600 text-white px-2 py-0.5 rounded-full">
              {previewSchedule.totalEvents} Doses Generated
            </span>
          </div>
          <p className="text-xs text-sky-800 leading-relaxed">
            {isStat ? (
              <span>1 STAT immediate medication event will be added to the Nurse Task Board.</span>
            ) : (
              <span>
                <strong>{frequency}</strong> ({frequency === 'TDS' ? '3 times/day' : frequency === 'BD' ? '2 times/day' : frequency === 'OD' ? '1 time/day' : 'Scheduled'}) × <strong>{durationDays} days</strong> = <strong>{previewSchedule.totalEvents} discrete administration events</strong> with tracked timestamps.
              </span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-lg shadow-brand-600/25 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{submitting ? 'Generating Schedule...' : 'Save & Generate Schedule'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
}

