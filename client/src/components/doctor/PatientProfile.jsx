import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge, StatBadge, AllergyBadge } from '../common/Badge';
import { QrCodeModal } from '../common/QrCodeModal';
import { CreatePrescriptionModal } from './CreatePrescriptionModal';
import { StopPrescriptionModal } from './StopPrescriptionModal';
import { 
  ArrowLeft, QrCode, Plus, Pill, AlertTriangle, Clock, 
  Activity, Calendar, Heart, Thermometer, User, ShieldAlert, 
  History, CheckCircle2, XCircle, Stethoscope
} from 'lucide-react';

export function PatientProfile({ patientId, onBack, onPrescribeNew }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, timeline, history

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [selectedRxToStop, setSelectedRxToStop] = useState(null);

  const fetchProfile = () => {
    setLoading(true);
    api.patients.getById(patientId)
      .then(res => {
        setProfileData(res.data);
      })
      .catch(err => {
        console.error('Error fetching patient profile:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (patientId) {
      fetchProfile();
    }
  }, [patientId]);

  if (loading || !profileData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Loading Patient Electronic Record...</span>
        </div>
      </div>
    );
  }

  const { patient, prescriptions = [], medicationTimeline = [] } = profileData;
  const activePrescriptions = prescriptions.filter(p => p.status === 'ACTIVE' || p.status === 'MODIFIED');
  const pastPrescriptions = prescriptions.filter(p => p.status === 'STOPPED');

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Back & Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <QrCode className="w-4 h-4 text-brand-600" />
            <span>Bedside QR Code</span>
          </button>
          
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Prescription</span>
          </button>
        </div>
      </div>

      {/* Patient Master Card Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-100">
          
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-brand-600/20">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-extrabold text-slate-900">{patient.name}</h1>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {patient.id}
                </span>
                <span className="text-xs text-slate-500">UHID: {patient.uhid}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Diagnosis:</strong> {patient.diagnosis}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span>{patient.age} yrs • {patient.gender}</span>
                <span>•</span>
                <span>Weight: <strong>{patient.weight} kg</strong></span>
                <span>•</span>
                <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                  Ward: {patient.ward} (Bed {patient.bed})
                </span>
              </div>
            </div>
          </div>

          {/* Documented Allergies Highlight Box */}
          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3 min-w-[240px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>DOCUMENTED ALLERGIES</span>
            </div>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map((allergy, i) => (
                  <AllergyBadge key={i} allergy={allergy} />
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">No known drug allergies (NKDA)</span>
            )}
          </div>

        </div>

        {/* Live Vitals Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Heart className="w-4 h-4 text-rose-500" />
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Blood Pressure</span>
              <span className="text-xs font-extrabold text-slate-800">{patient.vitals?.bp || '120/80'} mmHg</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Activity className="w-4 h-4 text-brand-500" />
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Heart Rate</span>
              <span className="text-xs font-extrabold text-slate-800">{patient.vitals?.hr || '76'} bpm</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Thermometer className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Body Temp</span>
              <span className="text-xs font-extrabold text-slate-800">{patient.vitals?.temp || '98.6'} °F</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Activity className="w-4 h-4 text-teal-500" />
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Oxygen (SpO2)</span>
              <span className="text-xs font-extrabold text-slate-800">{patient.vitals?.spo2 || '98'} %</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-brand-600 text-brand-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Active Prescriptions ({activePrescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'timeline'
              ? 'border-brand-600 text-brand-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Medication Schedule & Timeline ({medicationTimeline.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-brand-600 text-brand-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Prescription History ({prescriptions.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE PRESCRIPTIONS */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          {activePrescriptions.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center">
              <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No active prescriptions currently</p>
              <p className="text-xs text-slate-400 mt-1 mb-4">Click below to create an e-prescription with automatic schedule generation</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
              >
                <Plus className="w-4 h-4" /> Create Prescription
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePrescriptions.map(rx => (
                <div key={rx.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{rx.medicine}</h4>
                        <span className="text-xs font-semibold text-slate-600">{rx.dose} • {rx.route}</span>
                      </div>
                    </div>
                    {rx.isStat === 1 ? <StatBadge /> : <StatusBadge status={rx.status} />}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 py-3 border-y border-slate-100 my-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Frequency:</span>
                      <span className="font-semibold text-slate-800">{rx.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="font-semibold text-slate-800">{rx.durationDays} days (Start: {rx.startDate} {rx.startTime})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prescribing Doctor:</span>
                      <span className="font-semibold text-slate-800">{rx.doctorName}</span>
                    </div>
                    {rx.instructions && (
                      <div className="pt-1 text-[11px] text-slate-500 italic">
                        "{rx.instructions}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedRxToStop(rx);
                        setStopModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                    >
                      Stop / Discontinue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEDICATION TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Medication Schedule & Administration Log</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3">Scheduled Time</th>
                  <th className="py-3 px-3">Medicine & Dose</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Administered At</th>
                  <th className="py-3 px-3">Staff / Nurse</th>
                  <th className="py-3 px-3">Notes / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicationTimeline.map(item => {
                  const dt = new Date(item.scheduledTime);
                  const formattedTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const formattedDate = dt.toLocaleDateString([], { month: 'short', day: 'numeric' });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {formattedDate}, {formattedTime}
                        {item.isStat === 1 && <span className="ml-1.5 text-purple-700 font-bold text-[10px] bg-purple-100 px-1.5 py-0.5 rounded">STAT</span>}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {item.medicine} <span className="font-normal text-slate-600">({item.dose})</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{item.route}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.administeredAt ? new Date(item.administeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.administeredBy || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 italic max-w-xs truncate">
                        {item.reason ? `[${item.reason}] ${item.notes || ''}` : (item.notes || '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRESCRIPTION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Prescription Evolution & Audit History</h3>
          <div className="space-y-3">
            {prescriptions.map(p => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-800">{p.medicine} {p.dose}</span>
                    <StatusBadge status={p.status} />
                    <span className="text-[10px] text-slate-400 font-mono">{p.id}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {p.route} • {p.frequency} • {p.durationDays} days • Prescribed by {p.doctorName} on {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  {p.stoppedReason && (
                    <p className="text-xs text-rose-700 mt-2 font-medium bg-rose-50 p-2 rounded-lg border border-rose-100">
                      Discontinued by {p.stoppedBy || 'Physician'}: "{p.stoppedReason}" ({new Date(p.stoppedAt).toLocaleString()})
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        patient={patient}
      />

      <CreatePrescriptionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        patient={patient}
        onSuccess={() => fetchProfile()}
      />

      <StopPrescriptionModal
        isOpen={stopModalOpen}
        onClose={() => setStopModalOpen(false)}
        prescription={selectedRxToStop}
        patient={patient}
        onSuccess={() => fetchProfile()}
      />

    </div>
  );
}

