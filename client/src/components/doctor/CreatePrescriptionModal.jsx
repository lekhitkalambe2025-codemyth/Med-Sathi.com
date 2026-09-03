import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Pill, AlertTriangle, Clock, Calendar, Check, Stethoscope, 
  Sparkles, Info, ShieldAlert, Mic, MicOff, Volume2, UserPlus, User, Plus, X, ChevronDown 
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

export function CreatePrescriptionModal({ isOpen, onClose, patient: propPatient, patients: propPatients = [], onSuccess }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Patient Selection & Creation States
  const [patientList, setPatientList] = useState(propPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(propPatient?.id || propPatients[0]?.id || '');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [addingPatientLoading, setAddingPatientLoading] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: '45',
    gender: 'Male',
    weight: '68',
    ward: 'General Ward',
    bed: 'GW-09',
    allergies: '',
    diagnosis: 'Inpatient Evaluation'
  });

  // Fetch full hospital patients on open or sync with props
  useEffect(() => {
    if (isOpen) {
      api.patients.getAll()
        .then(res => {
          const fetched = res.data || [];
          setPatientList(fetched);
          if (propPatient) {
            setSelectedPatientId(propPatient.id);
          } else if (!selectedPatientId && fetched.length > 0) {
            setSelectedPatientId(fetched[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, propPatient]);

  const activePatient = patientList.find(p => p.id === selectedPatientId) || propPatient || patientList[0];

  const handleAddNewPatient = async (e) => {
    e.preventDefault();
    if (!newPatientForm.name.trim()) {
      showToast('Please enter a patient name', 'error');
      return;
    }

    setAddingPatientLoading(true);
    try {
      const payload = {
        ...newPatientForm,
        age: parseInt(newPatientForm.age, 10) || 45,
        allergies: newPatientForm.allergies ? newPatientForm.allergies.split(',').map(a => a.trim()).filter(Boolean) : []
      };
      const res = await api.patients.create(payload);
      const created = res.data;
      setPatientList(prev => [created, ...prev]);
      setSelectedPatientId(created.id);
      setIsAddingPatient(false);
      showToast(`Admitted ${created.name} (${created.id}) to ${created.ward} Bed ${created.bed}!`, 'success');
      setNewPatientForm({
        name: '',
        age: '45',
        gender: 'Male',
        weight: '68',
        ward: 'General Ward',
        bed: 'GW-09',
        allergies: '',
        diagnosis: 'Inpatient Evaluation'
      });
    } catch (err) {
      showToast(err.message || 'Failed to admit patient', 'error');
    } finally {
      setAddingPatientLoading(false);
    }
  };

  const [medicine, setMedicine] = useState('Paracetamol');
  const [dose, setDose] = useState('500 mg');
  const [route, setRoute] = useState('Oral');
  const [frequency, setFrequency] = useState('TDS');
  const [durationDays, setDurationDays] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [instructions, setInstructions] = useState('Take after meals with plenty of water.');
  const [isStat, setIsStat] = useState(false);

  // Voice Dictation States
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);

  const [safetyWarnings, setSafetyWarnings] = useState([]);
  const [previewSchedule, setPreviewSchedule] = useState({ totalEvents: 15, events: [] });
  const [submitting, setSubmitting] = useState(false);

  // Clinical Voice Entity Extractor
  const parseClinicalSpeech = (text) => {
    setVoiceTranscript(text);
    const lower = text.toLowerCase();

    // 1. Medicine detection
    const foundMed = COMMON_MEDICINES.find(m => lower.includes(m.name.toLowerCase()));
    if (foundMed) {
      setMedicine(foundMed.name);
      setDose(foundMed.defaultDose);
      setRoute(foundMed.defaultRoute);
      setFrequency(foundMed.defaultFreq);
    }

    // 2. Dose detection (e.g. 500mg, 1g, 40mg, 4mg)
    const doseMatch = lower.match(/(\d+(\.\d+)?)\s*(mg|g|mcg|ml|milligram|gram)/i);
    if (doseMatch) {
      let unit = doseMatch[3].toLowerCase();
      if (unit.startsWith('milli')) unit = 'mg';
      else if (unit.startsWith('g')) unit = 'g';
      setDose(`${doseMatch[1]} ${unit}`);
    }

    // 3. Route detection
    if (lower.includes('intravenous') || lower.includes('iv')) setRoute('IV');
    else if (lower.includes('oral') || lower.includes('mouth') || lower.includes('tablet')) setRoute('Oral');
    else if (lower.includes('intramuscular') || lower.includes('im')) setRoute('IM');

    // 4. STAT or Frequency detection
    if (lower.includes('stat') || lower.includes('immediately') || lower.includes('emergency')) {
      setIsStat(true);
      setFrequency('STAT');
      setDurationDays(1);
    } else if (lower.includes('tds') || lower.includes('thrice') || lower.includes('three times')) {
      setFrequency('TDS');
      setIsStat(false);
    } else if (lower.includes('bd') || lower.includes('twice') || lower.includes('two times')) {
      setFrequency('BD');
      setIsStat(false);
    } else if (lower.includes('od') || lower.includes('once') || lower.includes('daily')) {
      setFrequency('OD');
      setIsStat(false);
    } else if (lower.includes('q4h') || lower.includes('every 4 hour')) {
      setFrequency('Q4H');
      setIsStat(false);
    }

    // 5. Duration detection
    const durationMatch = lower.match(/for\s*(\d+)\s*day/i);
    if (durationMatch) {
      setDurationDays(parseInt(durationMatch[1], 10));
    }

    showToast(`Parsed: "${text}"`, 'success');
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech Recognition not supported in this browser. Please use Google Chrome/Edge or the sample prompts below.', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
        showToast('Microphone listening... Speak your prescription order now!', 'info');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          showToast('Microphone access blocked! Click the lock icon (🔒) in your browser URL bar and set Microphone to "Allow".', 'error');
        } else if (event.error === 'no-speech') {
          showToast('No speech was detected. Please speak closer to your mic or click a sample dictation button below.', 'info');
        } else if (event.error === 'network') {
          showToast('Speech network service unavailable. You can click any of the 1-click sample prompts below.', 'error');
        } else {
          showToast(`Speech recognition: ${event.error}`, 'info');
        }
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInterimTranscript(trans);
            parseClinicalSpeech(trans);
          } else {
            currentText += trans;
            setInterimTranscript(currentText);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
      showToast('Could not access microphone. Please check browser permissions.', 'error');
    }
  };

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
    if (!isOpen || !activePatient) return;

    // 1. Safety Check
    api.prescriptions.safetyCheck({
      patientId: activePatient.id,
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

  }, [isOpen, activePatient?.id, medicine, dose, route, frequency, durationDays, startDate, startTime, isStat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activePatient) {
      showToast('Please select or admit a patient first', 'error');
      return;
    }

    if (!medicine || !dose) {
      showToast('Please enter both medicine and dose', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientId: activePatient.id,
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Prescription & Auto-Generate Drug Chart" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Dynamic Target Patient Selection or Inline Inpatient Admission */}
        {isAddingPatient ? (
          <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-4 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-700" />
                <span className="text-xs font-black text-brand-900">Admit New Inpatient to Hospital</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPatient(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel & Select Existing
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                  placeholder="e.g. Amit Verma"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Age & Gender</label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    placeholder="Age"
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    className="flex-1 px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Ward *</label>
                <select
                  value={newPatientForm.ward}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, ward: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="General Ward">General Ward</option>
                  <option value="ICU">Intensive Care Unit (ICU)</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Surgical">Surgical Ward</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bed Number *</label>
                <input
                  type="text"
                  value={newPatientForm.bed}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, bed: e.target.value })}
                  placeholder="e.g. GW-09"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={newPatientForm.allergies}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddNewPatient}
                disabled={addingPatientLoading}
                className="px-4 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-sm transition-all hover-lift flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{addingPatientLoading ? 'Admitting Patient...' : 'Admit & Select for Prescription'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-black text-slate-800">Target Inpatient</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPatient(true)}
                className="text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-xl border border-brand-200 transition-colors flex items-center gap-1 shadow-subtle hover-lift"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add / Admit New Patient</span>
              </button>
            </div>

            {/* Inpatient Dropdown & Info Strip */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-full sm:w-1/2">
                <select
                  value={activePatient?.id || ''}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
                >
                  {patientList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.ward} • Bed {p.bed} • {p.age}y)
                    </option>
                  ))}
                </select>
              </div>

              {activePatient && (
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 font-medium">
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                    UHID: <strong>{activePatient.uhid || activePatient.id}</strong>
                  </span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                    {activePatient.gender} • {activePatient.age}y
                  </span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                    Ward: <strong className="text-brand-700">{activePatient.ward}</strong> (Bed {activePatient.bed})
                  </span>
                </div>
              )}
            </div>

            {/* Documented Allergies Warning */}
            {activePatient?.allergies && activePatient.allergies.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Documented Allergies:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {activePatient.allergies.map((a, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold border border-rose-200">
                      ⚠ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Voice-to-Prescription Dictation Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-2xl p-3.5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isListening ? 'bg-rose-500 text-white animate-ping' : 'bg-brand-500/30 text-brand-300'
              }`}>
                {isListening ? <Mic className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">AI Voice-to-Prescription</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                    Voice Dictation
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Speak naturally: e.g. "Paracetamol 500mg oral TDS for 5 days"</p>
              </div>
            </div>

            <button
              type="button"
              onClick={startVoiceDictation}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-lg shadow-rose-600/40'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isListening ? 'Stop Listening' : 'Start Mic'}</span>
            </button>
          </div>

          {/* Live Speech Feedback Stream */}
          {(isListening || interimTranscript) && (
            <div className="mb-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-700 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping flex-shrink-0"></span>
                <span className="text-slate-400 text-[11px] flex-shrink-0">Heard:</span>
                <span className="text-white font-mono font-bold truncate">
                  "{interimTranscript || 'Listening... Speak your prescription'}"
                </span>
              </div>
              {isListening && (
                <span className="text-[10px] text-rose-400 font-black uppercase tracking-wider flex-shrink-0 animate-pulse">
                  Live Mic
                </span>
              )}
            </div>
          )}

          {/* Quick 1-Click Voice Prompt Samples */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
              Sample Dictations:
            </span>
            {[
              "Paracetamol 500mg oral TDS for 5 days",
              "Ceftriaxone 1g IV BD for 7 days",
              "Ondansetron 4mg IV STAT immediately",
              "Metformin 500mg oral BD with meals"
            ].map((sample, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => parseClinicalSpeech(sample)}
                className="text-[10px] bg-slate-800/90 hover:bg-brand-900/60 hover:text-brand-200 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 transition-colors"
              >
                "{sample}"
              </button>
            ))}
          </div>
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

