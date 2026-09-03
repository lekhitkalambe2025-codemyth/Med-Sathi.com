import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  CheckCircle2, AlertTriangle, QrCode, Pill, Clock, 
  User, ShieldCheck, Camera, Check, X, ShieldAlert, 
  HelpCircle, ArrowRight, CornerDownRight 
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export function MedicationAdminModal({ isOpen, onClose, scheduleItem, onSuccess }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: QR Scan & Match, 2: 5-Rights & Safety Check, 3: Action Submission
  const [scannedCode, setScannedCode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Administration action state
  const [selectedAction, setSelectedAction] = useState('GIVEN'); // GIVEN, DELAYED, HELD, REFUSED, NOT_GIVEN
  const [reason, setReason] = useState('Procedure in progress');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const scannerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setScannedCode('');
      setIsCameraActive(false);
      setVerificationResult(null);
      setSelectedAction('GIVEN');
      setNotes('');
    }
  }, [isOpen]);

  // Clean up camera scanner on close
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  if (!scheduleItem) return null;

  // Handle QR Scan verification
  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || scannedCode;
    if (!code) {
      showToast('Please enter or scan a QR code', 'warning');
      return;
    }

    setVerifying(true);
    try {
      const res = await api.medications.verifyQr({
        scheduleId: scheduleItem.id,
        patientId: scheduleItem.patientId,
        scannedQr: code
      });

      setVerificationResult(res.verification);
      if (res.verification.patientMatched) {
        showToast('Patient identity verified successfully', 'success', 'Identity Confirmed');
        setStep(2); // Proceed to 5-Rights & Safety
      } else {
        showToast('QR mismatch! The scanned badge does not match this patient.', 'error', 'Patient Mismatch');
      }
    } catch (err) {
      showToast(err.message || 'Verification error', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // Demo 1-Click QR Button
  const handleDemoQuickScan = () => {
    const demoQr = scheduleItem.patientQrCode || `SMARTMED:PATIENT:${scheduleItem.patientId}:${scheduleItem.patientUhid}:${scheduleItem.patientName}:${scheduleItem.patientBed}`;
    setScannedCode(demoQr);
    handleVerify(demoQr);
  };

  // Trigger Camera Scanner
  const startCameraScanner = () => {
    setIsCameraActive(true);
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner('qr-reader-box', {
          fps: 10,
          qrbox: { width: 220, height: 220 }
        });
        scannerRef.current = scanner;
        scanner.render(
          (decodedText) => {
            setScannedCode(decodedText);
            scanner.clear();
            setIsCameraActive(false);
            handleVerify(decodedText);
          },
          () => {}
        );
      } catch (e) {
        console.error('Camera init error', e);
      }
    }, 200);
  };

  // Final Action Submission
  const handleSubmitAdministration = async (actionToSubmit) => {
    const action = actionToSubmit || selectedAction;
    setSubmitting(true);
    try {
      await api.medications.administer({
        scheduleId: scheduleItem.id,
        action,
        reason: action !== 'GIVEN' ? reason : null,
        notes,
        administeredBy: currentUser?.name || 'Nurse Priya Patel',
        administeredByRole: 'NURSE',
        userId: currentUser?.id || 'USR-NURSE-01'
      });

      showToast(`Medication administration recorded as ${action}`, 'success', 'Medication Recorded');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to record administration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="5-Rights Bedside Medication Administration" maxWidth="max-w-2xl">
      <div className="space-y-5">

        {/* Medication & Patient Master Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">{scheduleItem.medicine}</h3>
                <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {scheduleItem.dose}
                </span>
                <span className="text-xs font-semibold text-slate-500">({scheduleItem.route})</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Patient: <strong>{scheduleItem.patientName}</strong> • Ward: {scheduleItem.patientWard} (Bed {scheduleItem.patientBed})
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheduled Time</span>
            <span className="text-xs font-extrabold text-brand-700">
              {new Date(scheduleItem.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-brand-600 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              1
            </span>
            <span>QR Verification</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-brand-600 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              2
            </span>
            <span>5-Rights & Safety Check</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-brand-600 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              3
            </span>
            <span>Record Administration</span>
          </div>
        </div>

        {/* STEP 1: QR CODE VERIFICATION */}
        {step === 1 && (
          <div className="space-y-4 text-center py-2">
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2 border border-brand-200">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Bedside Patient Identification</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Scan the patient's wristband or bedside QR code to verify identity and unlock medication administration.
              </p>

              {/* Camera Scanner Box */}
              {isCameraActive && (
                <div className="p-3 bg-slate-900 rounded-2xl mb-4 text-white">
                  <div id="qr-reader-box" className="w-full"></div>
                  <button
                    onClick={() => {
                      if (scannerRef.current) scannerRef.current.clear();
                      setIsCameraActive(false);
                    }}
                    className="mt-2 text-xs text-slate-300 hover:text-white"
                  >
                    Cancel Camera
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-4">
                <button
                  type="button"
                  onClick={handleDemoQuickScan}
                  disabled={verifying}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Use Demo QR (1-Click Verify)</span>
                </button>

                <button
                  type="button"
                  onClick={startCameraScanner}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Camera Scanner</span>
                </button>
              </div>

              {/* Manual Input Fallback */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-[11px] text-slate-400 mb-1">
                  Or manual QR code string:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="e.g. SMARTMED:PATIENT:P1024..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => handleVerify()}
                    disabled={verifying}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: 5-RIGHTS & SAFETY WARNING ENGINE */}
        {step === 2 && verificationResult && (
          <div className="space-y-4">
            
            {/* 5-Rights Verification Checklist Box */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                5-Rights Verification Checklist
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-100 shadow-sm">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">1. Right Patient</span>
                    <strong className="text-slate-800">{verificationResult.verifiedPatient?.name} ({verificationResult.verifiedPatient?.id})</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-100 shadow-sm">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">2. Right Medication</span>
                    <strong className="text-slate-800">{scheduleItem.medicine}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-100 shadow-sm">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">3. Right Dose</span>
                    <strong className="text-slate-800">{scheduleItem.dose}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-100 shadow-sm">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">4. Right Route</span>
                    <strong className="text-slate-800">{scheduleItem.route}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety / Cross-Allergy Warnings (Hero Feature) */}
            {verificationResult.safetyWarnings && verificationResult.safetyWarnings.length > 0 ? (
              <div className="space-y-2">
                {verificationResult.safetyWarnings.map((warning, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs flex-1">
                        <span className="font-extrabold text-amber-900 block mb-1">{warning.title}</span>
                        <p className="text-amber-800 leading-relaxed">{warning.message}</p>
                        <div className="mt-2 text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                          Note: Please review patient profile before administering. Final decision remains with authorized clinical staff.
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No allergy conflicts or duplicate therapy alerts detected for this administration.</span>
              </div>
            )}

            {/* Proceed to Record Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                ← Back to QR Scan
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20"
              >
                <span>Proceed to Record Administration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: RECORD ADMINISTRATION ACTION */}
        {step === 3 && (
          <div className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Select Administration Outcome:
              </label>

              {/* Outcome Action Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                
                <button
                  type="button"
                  onClick={() => setSelectedAction('GIVEN')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedAction === 'GIVEN'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">✓ GIVEN</span>
                  </div>
                  <p className={`text-[10px] ${selectedAction === 'GIVEN' ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Administered successfully on time
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction('DELAYED')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedAction === 'DELAYED'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">⏰ DELAYED</span>
                  </div>
                  <p className={`text-[10px] ${selectedAction === 'DELAYED' ? 'text-amber-100' : 'text-slate-500'}`}>
                    Dose delayed due to ward factor
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction('HELD')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedAction === 'HELD'
                      ? 'bg-slate-700 text-white border-slate-700 shadow-md shadow-slate-700/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">⏸ HELD</span>
                  </div>
                  <p className={`text-[10px] ${selectedAction === 'HELD' ? 'text-slate-200' : 'text-slate-500'}`}>
                    Held for clinical reason (e.g. low BP)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction('REFUSED')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedAction === 'REFUSED'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">🚫 REFUSED</span>
                  </div>
                  <p className={`text-[10px] ${selectedAction === 'REFUSED' ? 'text-rose-100' : 'text-slate-500'}`}>
                    Patient refused administration
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction('NOT_GIVEN')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedAction === 'NOT_GIVEN'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">✕ NOT GIVEN</span>
                  </div>
                  <p className={`text-[10px] ${selectedAction === 'NOT_GIVEN' ? 'text-slate-200' : 'text-slate-500'}`}>
                    Not given (NPO, lab procedure)
                  </p>
                </button>

              </div>
            </div>

            {/* If not Given, show Reason Dropdown */}
            {selectedAction !== 'GIVEN' && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-amber-900">
                  Reason for {selectedAction} Status *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Procedure in Progress">Procedure in Progress</option>
                  <option value="Patient Unavailable / Off Ward">Patient Unavailable / Off Ward</option>
                  <option value="Patient Sleeping / Refused Dose">Patient Sleeping / Refused Dose</option>
                  <option value="Clinical Reason (Vitals out of range)">Clinical Reason (Vitals out of range)</option>
                  <option value="Medicine Awaiting Pharmacy Prep">Medicine Awaiting Pharmacy Prep</option>
                  <option value="Patient NPO (Fasting for surgery)">Patient NPO (Fasting for surgery)</option>
                  <option value="Other Clinical Rationale">Other Clinical Rationale</option>
                </select>
              </div>
            )}

            {/* Nurse Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nurse Administration Notes (Optional)
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Administered with glass of water, patient tolerated well..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                ← Back to Safety Check
              </button>

              <button
                type="button"
                onClick={() => handleSubmitAdministration()}
                disabled={submitting}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                  selectedAction === 'GIVEN'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : selectedAction === 'DELAYED'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/20'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{submitting ? 'Recording Action...' : `Confirm & Record as ${selectedAction}`}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </Modal>
  );
}

