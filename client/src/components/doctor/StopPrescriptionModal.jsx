import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AlertOctagon, XCircle } from 'lucide-react';

export function StopPrescriptionModal({ isOpen, onClose, prescription, patient, onSuccess }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [reason, setReason] = useState('Course completed / Patient improved');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!prescription) return null;

  const handleStop = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.prescriptions.stop(prescription.id, {
        stoppedReason: notes ? `${reason} - ${notes}` : reason,
        stoppedBy: currentUser?.name || 'Dr. Rajesh Sharma',
        userId: currentUser?.id || 'USR-DOC-01'
      });

      showToast(`Prescription for ${prescription.medicine} stopped. Future scheduled doses discontinued.`, 'info', 'Prescription Discontinued');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to stop prescription', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Discontinue / Stop Prescription" maxWidth="max-w-md">
      <form onSubmit={handleStop} className="space-y-4">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900">
            <span className="font-bold block mb-0.5">
              Stop {prescription.medicine} ({prescription.dose})
            </span>
            <p className="leading-tight text-rose-800">
              All remaining DUE / UPCOMING schedule events will be discontinued. This action is permanently recorded in the hospital audit trail.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Rationale *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
          >
            <option value="Course completed / Patient improved">Course completed / Patient improved</option>
            <option value="Adverse drug reaction / Allergy suspected">Adverse drug reaction / Allergy suspected</option>
            <option value="Switched to alternative drug/route">Switched to alternative drug/route</option>
            <option value="Lab/Vitals contraindication">Lab/Vitals contraindication</option>
            <option value="Discharged / Patient transfer">Discharged / Patient transfer</option>
            <option value="Other clinical rationale">Other clinical rationale</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Physician Clinical Notes
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add relevant clinical observations..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20"
          >
            <XCircle className="w-4 h-4" />
            <span>{submitting ? 'Discontinuing...' : 'Confirm Stop Prescription'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

