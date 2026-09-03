import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AllergyBadge, StatBadge } from '../common/Badge';
import { CreatePrescriptionModal } from './CreatePrescriptionModal';
import { QrCodeModal } from '../common/QrCodeModal';
import { 
  Users, Stethoscope, Clock, Zap, Search, Filter, 
  Plus, ArrowRight, Eye, AlertTriangle, ShieldCheck, QrCode 
} from 'lucide-react';

export function DoctorDashboard({ onSelectPatient }) {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [patientForPrescription, setPatientForPrescription] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [patientForQr, setPatientForQr] = useState(null);

  const fetchPatients = () => {
    setLoading(true);
    api.patients.getAll({ ward: selectedWard, search })
      .then(res => setPatients(res.data || []))
      .catch(err => console.error('Error fetching patients:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPatients();
  }, [selectedWard, search]);

  const totalPatients = patients.length;
  const totalActiveRx = patients.reduce((acc, p) => acc + (p.activePrescriptionsCount || 0), 0);
  const totalDueToday = patients.reduce((acc, p) => acc + (p.dueCount || 0), 0);
  const statCount = patients.filter(p => p.hasPendingStat).length;

  return (
    <div className="space-y-6">
      
      {/* Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200/80">
              Inpatient Clinical Station
            </span>
            <span className="text-[11px] font-medium text-slate-400">Shift Live</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Good morning, {currentUser?.name || 'Dr. Sharma'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Internal Medicine & Closed-Loop Prescribing Station
          </p>
        </div>

        <button
          onClick={() => {
            if (patients.length > 0) {
              setPatientForPrescription(patients[0]);
              setCreateModalOpen(true);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-md shadow-brand-600/25 transition-all hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Create Prescription</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border-t-4 border-t-sky-500 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Inpatients</span>
            <span className="text-2xl font-black text-slate-900">{totalPatients}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Active in ward registry</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shadow-subtle">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-t-4 border-t-teal-500 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Active Prescriptions</span>
            <span className="text-2xl font-black text-slate-900">{totalActiveRx}</span>
            <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">Verified e-Orders</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shadow-subtle">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-t-4 border-t-blue-500 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Medicines Due Today</span>
            <span className="text-2xl font-black text-slate-900">{totalDueToday}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Across all shifts</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-subtle">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-t-4 border-t-purple-500 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block mb-1">Pending STAT Orders</span>
            <span className="text-2xl font-black text-purple-900">{statCount}</span>
            <span className="text-[10px] text-purple-700 font-bold block mt-0.5">Urgent priority</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shadow-subtle animate-stat-urgent">
            <Zap className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Patients Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        
        {/* Table Controls (Search & Ward Filter) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search patient, UHID, or bed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all cursor-pointer"
            >
              <option value="ALL">All Hospital Wards</option>
              <option value="General Ward">General Ward</option>
              <option value="ICU">Intensive Care Unit (ICU)</option>
              <option value="Surgical Ward">Surgical Ward</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatric Ward">Pediatric Ward</option>
            </select>
          </div>
        </div>

        {/* Patients List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/90">
                <th className="py-3.5 px-4">Patient ID</th>
                <th className="py-3.5 px-4">Patient Profile</th>
                <th className="py-3.5 px-4">Age / Gender</th>
                <th className="py-3.5 px-4">Ward & Bed</th>
                <th className="py-3.5 px-4">Documented Allergies</th>
                <th className="py-3.5 px-4 text-center">Active Rx</th>
                <th className="py-3.5 px-4">Status / Alert</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No patients found matching the criteria.
                  </td>
                </tr>
              ) : (
                patients.map(p => (
                  <tr 
                    key={p.id}
                    onClick={() => onSelectPatient(p.id)}
                    className="hover:bg-sky-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                      <span className="bg-brand-50/80 px-2 py-0.5 rounded border border-brand-200/70">
                        {p.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 group-hover:text-brand-700 transition-colors">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">UHID: {p.uhid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {p.age}y • {p.gender}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{p.ward}</span>
                      <span className="text-slate-500 ml-1 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">Bed {p.bed}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.allergies && p.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.allergies.map((a, i) => (
                            <AllergyBadge key={i} allergy={a} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No allergies reported</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200/80">
                        {p.activePrescriptionsCount || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.hasPendingStat ? (
                        <StatBadge />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200/80 shadow-subtle">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Stable
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setPatientForQr(p);
                            setQrModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg border border-slate-200/80 transition-all shadow-subtle hover-lift"
                          title="Bedside QR Identifier"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectPatient(p.id)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setPatientForPrescription(p);
                            setCreateModalOpen(true);
                          }}
                          className="px-3 py-1 text-xs font-bold text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 rounded-lg transition-colors shadow-subtle"
                        >
                          + Prescribe
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Prescription Creator Modal */}
      <CreatePrescriptionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        patient={patientForPrescription}
        onSuccess={() => fetchPatients()}
      />

      {/* Bedside QR Identifier Modal */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        patient={patientForQr}
      />

    </div>
  );
}

