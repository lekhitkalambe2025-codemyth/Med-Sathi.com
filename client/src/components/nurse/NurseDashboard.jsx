import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, StatBadge, AllergyBadge } from '../common/Badge';
import { MedicationAdminModal } from './MedicationAdminModal';
import { 
  ClipboardList, Clock, Zap, AlertCircle, CheckCircle2, 
  Search, Filter, QrCode, ArrowRight, UserCheck, ShieldAlert, 
  HeartHandshake 
} from 'lucide-react';

export function NurseDashboard({ onSelectPatientProfile }) {
  const { currentUser } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [counts, setCounts] = useState({ due: 0, upcoming: 0, overdue: 0, completed: 0, stat: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DUE'); // DUE, UPCOMING, OVERDUE, COMPLETED, STAT, ALL
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [search, setSearch] = useState('');

  const [selectedScheduleForAdmin, setSelectedScheduleForAdmin] = useState(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const fetchSchedules = () => {
    setLoading(true);
    api.medications.getSchedules({ tab: activeTab, ward: selectedWard, search })
      .then(res => {
        setSchedules(res.data || []);
        if (res.counts) setCounts(res.counts);
      })
      .catch(err => console.error('Error fetching schedules:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSchedules();
    const interval = setInterval(fetchSchedules, 12000);
    return () => clearInterval(interval);
  }, [activeTab, selectedWard, search]);

  const handleOpenAdminModal = (item) => {
    setSelectedScheduleForAdmin(item);
    setAdminModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {currentUser?.name || 'Nurse Priya'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active Shift Medication Tasks & Closed-Loop Administration Station
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Shift Live
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        <button
          onClick={() => setActiveTab('DUE')}
          className={`p-4 rounded-2xl border text-left transition-all hover-lift ${
            activeTab === 'DUE'
              ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/25 ring-2 ring-sky-400/30'
              : 'glass-card text-slate-700 hover:border-sky-300'
          }`}
        >
          <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${activeTab === 'DUE' ? 'text-sky-100' : 'text-slate-400'}`}>
            Due Now
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-black">{counts.due}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'DUE' ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-600'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('STAT')}
          className={`p-4 rounded-2xl border text-left transition-all hover-lift ${
            activeTab === 'STAT'
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white border-purple-700 shadow-md shadow-purple-600/25 ring-2 ring-purple-400/30'
              : 'glass-card text-slate-700 border-purple-200/80 hover:border-purple-400'
          }`}
        >
          <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${activeTab === 'STAT' ? 'text-purple-100' : 'text-purple-700'}`}>
            ⚡ STAT Orders
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-black">{counts.stat}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'STAT' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700 animate-stat-urgent'}`}>
              <Zap className="w-4 h-4" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`p-4 rounded-2xl border text-left transition-all hover-lift ${
            activeTab === 'OVERDUE'
              ? 'bg-gradient-to-br from-rose-600 to-rose-700 text-white border-rose-700 shadow-md shadow-rose-600/25 ring-2 ring-rose-400/30'
              : 'glass-card text-slate-700 hover:border-rose-300'
          }`}
        >
          <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${activeTab === 'OVERDUE' ? 'text-rose-100' : 'text-slate-400'}`}>
            Overdue
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-black">{counts.overdue}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'OVERDUE' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`p-4 rounded-2xl border text-left transition-all hover-lift ${
            activeTab === 'UPCOMING'
              ? 'bg-gradient-to-br from-brand-600 to-teal-600 text-white border-brand-700 shadow-md shadow-brand-600/25 ring-2 ring-brand-400/30'
              : 'glass-card text-slate-700 hover:border-brand-300'
          }`}
        >
          <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${activeTab === 'UPCOMING' ? 'text-brand-100' : 'text-slate-400'}`}>
            Upcoming
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-black">{counts.upcoming}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'UPCOMING' ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-600'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`p-4 rounded-2xl border text-left transition-all hover-lift ${
            activeTab === 'COMPLETED'
              ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/30'
              : 'glass-card text-slate-700 hover:border-emerald-300'
          }`}
        >
          <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${activeTab === 'COMPLETED' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Completed
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-black">{counts.completed}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'COMPLETED' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </button>

      </div>

      {/* Task Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {[
              { id: 'DUE', label: 'Due Now' },
              { id: 'STAT', label: '⚡ STAT' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'OVERDUE', label: 'Overdue' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'ALL', label: 'All Tasks' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Ward Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search patient, bed or drug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Wards</option>
              <option value="General Ward">General Ward</option>
              <option value="ICU">ICU</option>
              <option value="Surgical Ward">Surgical Ward</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatric Ward">Pediatric Ward</option>
            </select>
          </div>

        </div>

        {/* Medication Schedule List / Cards */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              Loading medication tasks...
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No medication tasks in this category</p>
              <p className="text-xs text-slate-400 mt-0.5">Switch tabs or clear filters to view other medication rounds</p>
            </div>
          ) : (
            schedules.map(item => {
              const dt = new Date(item.scheduledTime);
              const formattedTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenAdminModal(item)}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-sky-50/20 cursor-pointer transition-all ${
                    item.isStat === 1 ? 'bg-purple-50/40 border-l-4 border-l-purple-600' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  
                  {/* Left: Time & Medicine */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/80 text-slate-800 border border-slate-200/80 flex-shrink-0 shadow-subtle">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Round</span>
                      <span className="text-xs font-black text-slate-900">{formattedTime}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-sm font-black text-slate-900">{item.medicine}</span>
                        <span className="text-xs font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/80">
                          {item.dose}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">({item.route})</span>
                        {item.isStat === 1 && <StatBadge />}
                        <StatusBadge status={item.status} />
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-slate-600 flex-wrap">
                        <span className="font-extrabold text-slate-900">{item.patientName}</span>
                        <span className="text-slate-400 font-mono text-[11px]">({item.patientId})</span>
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px] border border-slate-200/60">
                          {item.patientWard} • Bed: <strong className="text-slate-900">{item.patientBed}</strong>
                        </span>
                        {item.patientAllergies && item.patientAllergies.length > 0 && (
                          <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80 text-[11px]">
                            ⚠ Allergy: {item.patientAllergies.join(', ')}
                          </span>
                        )}
                      </div>

                      {item.rxInstructions && (
                        <p className="text-[11px] text-slate-400 italic mt-1.5">
                          Note: "{item.rxInstructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {item.status === 'GIVEN' ? (
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5 justify-end">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Administered
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          by {item.administeredBy || 'Nurse'} at {new Date(item.administeredAt || item.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAdminModal(item);
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-md transition-all hover-lift ${
                          item.isStat === 1
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-600/25'
                            : 'bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-brand-600/25'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Scan QR & Administer</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Hero 5-Rights Bedside Administration Modal */}
      <MedicationAdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        scheduleItem={selectedScheduleForAdmin}
        onSuccess={() => fetchSchedules()}
      />

    </div>
  );
}

