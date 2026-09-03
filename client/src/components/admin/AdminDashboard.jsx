import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  BarChart3, CheckCircle2, Clock, AlertCircle, Zap, Shield, 
  TrendingUp, RefreshCw, MapPin, Activity, HelpCircle, Users, 
  UserPlus, Search, Filter, QrCode, ArrowRight, Eye, ChevronRight, 
  X, AlertTriangle, Calendar, Sparkles, Building, Layers, Timer 
} from 'lucide-react';
import { QrCodeModal } from '../common/QrCodeModal';

const PHASE_CONFIG = {
  'Phase 1': {
    badge: 'Phase 1: Arrival & Triage',
    sub: 'Triage & Bedside Intake',
    color: 'bg-amber-50 text-amber-800 border-amber-200/90',
    dot: 'bg-amber-500'
  },
  'Phase 2': {
    badge: 'Phase 2: Active Treatment',
    sub: 'Inpatient eMAR & Rounding',
    color: 'bg-sky-50 text-sky-800 border-sky-200/90',
    dot: 'bg-sky-500'
  },
  'Phase 3': {
    badge: 'Phase 3: Stabilization',
    sub: 'Recovery & Discharge Ready',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    dot: 'bg-emerald-500'
  }
};

function getArrivalElapsed(dateString) {
  if (!dateString) return 'Just now';
  const arrival = new Date(dateString);
  const now = new Date();
  const diffMs = now - arrival;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;
  return `${diffDays}d ${diffHours % 24}h ago`;
}

export function AdminDashboard({ onNavigateToAudit, initialTab = 'overview', onSelectPatient }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' or 'admissions'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inpatient Admissions & Arrival Tracking State
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientSearch, setPatientSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');

  // Admit Inpatient Modal State
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [admitLoading, setAdmitLoading] = useState(false);
  const [admitSuccess, setAdmitSuccess] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedPatientForQr, setSelectedPatientForQr] = useState(null);

  const [admitForm, setAdmitForm] = useState({
    name: '',
    arrivalPhase: 'Phase 1',
    admittedAt: new Date().toISOString().slice(0, 16),
    ward: '',
    bed: '',
    age: '',
    gender: 'Male',
    weight: '',
    diagnosis: '',
    allergies: ''
  });

  // Sync tab with initialTab prop
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const fetchAnalytics = () => {
    setLoading(true);
    api.analytics.getHospitalOverview()
      .then(res => setAnalyticsData(res.data))
      .catch(err => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  };

  const fetchPatients = () => {
    setPatientsLoading(true);
    api.patients.getAll({ ward: wardFilter !== 'ALL' ? wardFilter : undefined, search: patientSearch })
      .then(res => setPatients(res.data || []))
      .catch(err => console.error('Error fetching patients:', err))
      .finally(() => setPatientsLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
    fetchPatients();
    const interval = setInterval(() => {
      fetchAnalytics();
      fetchPatients();
    }, 12000);
    return () => clearInterval(interval);
  }, [wardFilter, patientSearch]);

  const handlePhaseChange = async (patientId, newPhase) => {
    try {
      await api.patients.updatePhase(patientId, newPhase);
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, arrivalPhase: newPhase } : p));
    } catch (e) {
      console.error('Failed to update phase', e);
    }
  };

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    if (!admitForm.name.trim()) return;

    setAdmitLoading(true);
    setAdmitSuccess('');
    try {
      const payload = {
        name: admitForm.name.trim(),
        arrivalPhase: admitForm.arrivalPhase || 'Phase 1',
        admittedAt: admitForm.admittedAt ? new Date(admitForm.admittedAt).toISOString() : new Date().toISOString(),
        ward: admitForm.ward || 'General Ward',
        bed: admitForm.bed || 'Triage-B01',
        age: parseInt(admitForm.age, 10) || 45,
        gender: admitForm.gender || 'Male',
        weight: parseFloat(admitForm.weight) || 68.0,
        diagnosis: admitForm.diagnosis || 'Inpatient Admission & Clinical Evaluation',
        allergies: admitForm.allergies ? admitForm.allergies.split(',').map(a => a.trim()).filter(Boolean) : []
      };

      const res = await api.patients.create(payload);
      setAdmitSuccess(`Admitted ${res.data.name} to ${res.data.ward} Bed ${res.data.bed} (${res.data.arrivalPhase})!`);
      fetchPatients();
      setTimeout(() => {
        setAdmitModalOpen(false);
        setAdmitSuccess('');
        setAdmitForm({
          name: '',
          arrivalPhase: 'Phase 1',
          admittedAt: new Date().toISOString().slice(0, 16),
          ward: '',
          bed: '',
          age: '',
          gender: 'Male',
          weight: '',
          diagnosis: '',
          allergies: ''
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to admit patient:', err);
    } finally {
      setAdmitLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const currentPhase = p.arrivalPhase || 'Phase 1';
    if (phaseFilter !== 'ALL' && currentPhase !== phaseFilter) return false;
    return true;
  });

  const phaseCounts = {
    total: patients.length,
    phase1: patients.filter(p => (p.arrivalPhase || 'Phase 1') === 'Phase 1').length,
    phase2: patients.filter(p => p.arrivalPhase === 'Phase 2').length,
    phase3: patients.filter(p => p.arrivalPhase === 'Phase 3').length
  };

  if (loading && !analyticsData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Computing Real-Time Hospital Analytics...</span>
        </div>
      </div>
    );
  }

  const { summary, statusDistribution, wardPerformance, delayReasons, hourlyTrends } = analyticsData || {};

  return (
    <div className="space-y-6">
      
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200/80">
              Chief Medical Officer & Admin Console
            </span>
            <span className="text-[11px] font-medium text-slate-400">Live Hospital Sync</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Clinical Governance & Inpatient Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Admit patients directly, monitor arrival phases (Phase 1, 2, 3) & audit compliance
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct Admit Inpatient Button */}
          <button
            onClick={() => setAdmitModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-600 via-sky-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-md shadow-brand-600/25 transition-all hover-lift"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Admit / Add Patient</span>
          </button>

          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-subtle transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
            <span>Sync</span>
          </button>

          <button
            onClick={onNavigateToAudit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold shadow-subtle transition-all"
          >
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-700 bg-brand-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Hospital Overview & KPIs</span>
        </button>

        <button
          onClick={() => setActiveTab('admissions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all relative ${
            activeTab === 'admissions'
              ? 'border-brand-600 text-brand-700 bg-brand-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Inpatient Admissions & Arrival Tracking</span>
          <span className="text-[10px] bg-brand-100 text-brand-800 font-extrabold px-1.5 py-0.2 rounded-full">
            {patients.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: INPATIENT ADMISSIONS & ARRIVAL PHASES */}
      {activeTab === 'admissions' && (
        <div className="space-y-5">
          
          {/* Arrival Phase Summary Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass-card p-4 rounded-2xl border-l-4 border-l-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Total Hospital Inpatients</span>
                <p className="text-2xl font-black text-slate-900">{phaseCounts.total}</p>
                <span className="text-[11px] text-slate-500">Live across all wards</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-0.5">Phase 1: Arrival & Triage</span>
                <p className="text-2xl font-black text-amber-900">{phaseCounts.phase1}</p>
                <span className="text-[11px] text-slate-500">Intake & initial assessment</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border-l-4 border-l-sky-500 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block mb-0.5">Phase 2: Active Treatment</span>
                <p className="text-2xl font-black text-sky-900">{phaseCounts.phase2}</p>
                <span className="text-[11px] text-slate-500">Bed assigned & eMAR charted</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">Phase 3: Stabilization</span>
                <p className="text-2xl font-black text-emerald-900">{phaseCounts.phase3}</p>
                <span className="text-[11px] text-slate-500">Recovering & discharge planning</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filters Strip */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-subtle">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search patient, UHID, or bed..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {['ALL', 'Phase 1', 'Phase 2', 'Phase 3'].map((ph) => (
                  <button
                    key={ph}
                    onClick={() => setPhaseFilter(ph)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      phaseFilter === ph
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {ph === 'ALL' ? 'All Phases' : ph}
                  </button>
                ))}
              </div>

              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="ALL">All Hospital Wards</option>
                <option value="General Ward">General Ward</option>
                <option value="ICU">ICU</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Surgical">Surgical Ward</option>
              </select>
            </div>
          </div>

          {/* Admissions & Arrival Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Patient Profile</th>
                    <th className="py-3 px-4">Arrival Timestamp & Duration</th>
                    <th className="py-3 px-4">Arrival / Care Phase</th>
                    <th className="py-3 px-4">Ward & Bed Allocation</th>
                    <th className="py-3 px-4 text-center">Active Rx</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patientsLoading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">Loading inpatient directory...</td>
                    </tr>
                  ) : filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">
                        No inpatients found matching filters. Click "+ Admit / Add Patient" to add one!
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map(p => {
                      const currentPhase = p.arrivalPhase || 'Phase 1';
                      const phaseInfo = PHASE_CONFIG[currentPhase] || PHASE_CONFIG['Phase 1'];
                      const arrivalElapsed = getArrivalElapsed(p.admittedAt);
                      const formattedTime = p.admittedAt 
                        ? new Date(p.admittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '10:00 AM';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          
                          {/* Patient Name & UHID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200/80 text-brand-700 font-black flex items-center justify-center text-xs shadow-2xs">
                                {p.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 block">{p.name}</span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  UHID: {p.uhid || p.id} • {p.age}y • {p.gender}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Arrival Timestamp & Duration Elapsed */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                                <Timer className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block">
                                  {arrivalElapsed}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Arrived at {formattedTime}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Care Phase Selector */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={currentPhase}
                                onChange={(e) => handlePhaseChange(p.id, e.target.value)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer focus:outline-none ${phaseInfo.color}`}
                              >
                                <option value="Phase 1">🟡 Phase 1: Arrival & Triage</option>
                                <option value="Phase 2">🔵 Phase 2: Active Treatment</option>
                                <option value="Phase 3">🟢 Phase 3: Stabilization</option>
                              </select>
                            </div>
                          </td>

                          {/* Ward & Bed No */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-800">{p.ward}</span>
                              <span className="text-[11px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                Bed {p.bed}
                              </span>
                            </div>
                          </td>

                          {/* Active Prescriptions */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-bold text-xs text-slate-800 border border-slate-200/80">
                              {p.activePrescriptionsCount || 0}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedPatientForQr(p);
                                  setQrModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                                title="Bedside QR Identifier"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                              {onSelectPatient && (
                                <button
                                  onClick={() => onSelectPatient(p.id)}
                                  className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                  View
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: HOSPITAL OVERVIEW & GOVERNANCE KPIS */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Medicines Due</span>
              <p className="text-2xl font-black text-slate-800">{summary?.dueSchedules || 0}</p>
              <span className="text-[10px] text-amber-700 font-bold mt-1 inline-block">Active rounds</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Given Doses</span>
              <p className="text-2xl font-black text-emerald-600">{summary?.givenSchedules || 0}</p>
              <span className="text-[10px] text-emerald-700 font-bold mt-1 inline-block">Administered</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Overdue Doses</span>
              <p className="text-2xl font-black text-rose-600">{summary?.overdueSchedules || 0}</p>
              <span className="text-[10px] text-rose-700 font-bold mt-1 inline-block">Needs escalation</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Emergency STAT</span>
              <p className="text-2xl font-black text-purple-600">{summary?.statOrders || 0}</p>
              <span className="text-[10px] text-purple-700 font-bold mt-1 inline-block">Urgent orders</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Active Inpatients</span>
              <p className="text-2xl font-black text-sky-600">{summary?.totalPatients || patients.length}</p>
              <span className="text-[10px] text-sky-700 font-bold mt-1 inline-block">Admitted</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Compliance Rate</span>
              <p className="text-2xl font-black text-slate-900">{summary?.onTimeComplianceRate || 98}%</p>
              <span className="text-[10px] text-emerald-700 font-bold mt-1 inline-block">JCI Benchmark</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Status Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Hospital Medication Administration Status
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">Real-time status of scheduled clinical doses</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(statusDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val, name) => [`${val} Doses`, name]}
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ward-wise On-Time Compliance */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Ward-Wise Administration Performance
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">On-Time compliance by ward</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wardPerformance || []} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis type="category" dataKey="ward" tick={{ fontSize: 11, fill: '#334155' }} />
                    <Tooltip 
                      formatter={(val) => [`${val}%`, 'Compliance']}
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="compliance" fill="#0284c7" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bedside QR Code Modal */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        patient={selectedPatientForQr}
      />

      {/* Admit Inpatient Modal (Admin Station) */}
      {admitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-400/30">
                  <UserPlus className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Admit Inpatient (Admin Portal)</h3>
                  <p className="text-xs text-slate-400">Records arrival time, arrival phase (1, 2, 3), and bed allocation</p>
                </div>
              </div>
              <button
                onClick={() => setAdmitModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1-Click Quick Fill Presets */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                1-Click Arrival Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setAdmitForm({
                    name: 'Rohit Deshmukh',
                    arrivalPhase: 'Phase 1',
                    admittedAt: new Date().toISOString().slice(0, 16),
                    ward: 'General Ward',
                    bed: 'GW-12',
                    age: '38',
                    gender: 'Male',
                    weight: '72',
                    diagnosis: 'Acute Gastroenteritis',
                    allergies: 'None'
                  })}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-800 font-semibold text-slate-700 shadow-2xs"
                >
                  🟡 + Rohit D. (Phase 1 - Just Arrived)
                </button>
                <button
                  type="button"
                  onClick={() => setAdmitForm({
                    name: 'Kavita Mehra',
                    arrivalPhase: 'Phase 2',
                    admittedAt: new Date(Date.now() - 45 * 60000).toISOString().slice(0, 16),
                    ward: 'ICU',
                    bed: 'ICU-04',
                    age: '61',
                    gender: 'Female',
                    weight: '58',
                    diagnosis: 'Severe Sepsis',
                    allergies: 'Penicillin'
                  })}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-sky-400 hover:text-sky-800 font-semibold text-slate-700 shadow-2xs"
                >
                  🔵 + Kavita M. (Phase 2 - ICU Care)
                </button>
                <button
                  type="button"
                  onClick={() => setAdmitForm({
                    name: 'Manmohan Lal',
                    arrivalPhase: 'Phase 3',
                    admittedAt: new Date(Date.now() - 36 * 3600000).toISOString().slice(0, 16),
                    ward: 'Cardiology',
                    bed: 'CARD-02',
                    age: '70',
                    gender: 'Male',
                    weight: '76',
                    diagnosis: 'Post-MI Stabilization',
                    allergies: 'Aspirin'
                  })}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-800 font-semibold text-slate-700 shadow-2xs"
                >
                  🟢 + Manmohan L. (Phase 3 - Recovery)
                </button>
              </div>
            </div>

            {/* Admission Form */}
            <form onSubmit={handleAdmitSubmit} className="p-5 space-y-3.5 text-xs">
              {admitSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{admitSuccess}</span>
                </div>
              )}

              {/* Patient Name (Only required field) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  value={admitForm.name}
                  onChange={(e) => setAdmitForm({ ...admitForm, name: e.target.value })}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              {/* Arrival Phase Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Arrival & Care Phase
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'Phase 1', label: 'Phase 1', desc: 'Arrival / Triage', color: 'border-amber-400 bg-amber-50/60 text-amber-900' },
                    { key: 'Phase 2', label: 'Phase 2', desc: 'Active Inpatient', color: 'border-sky-400 bg-sky-50/60 text-sky-900' },
                    { key: 'Phase 3', label: 'Phase 3', desc: 'Stabilization', color: 'border-emerald-400 bg-emerald-50/60 text-emerald-900' }
                  ].map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setAdmitForm({ ...admitForm, arrivalPhase: p.key })}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        admitForm.arrivalPhase === p.key
                          ? `${p.color} ring-2 ring-brand-500/20 shadow-xs font-bold`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs font-extrabold">{p.label}</span>
                      <span className="block text-[10px] text-slate-500">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Arrival Time & Ward */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Arrival Timestamp (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={admitForm.admittedAt}
                    onChange={(e) => setAdmitForm({ ...admitForm, admittedAt: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ward No / Department (Optional)
                  </label>
                  <select
                    value={admitForm.ward}
                    onChange={(e) => setAdmitForm({ ...admitForm, ward: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="">-- Unassigned / General Ward --</option>
                    <option value="General Ward">General Ward</option>
                    <option value="ICU">Intensive Care Unit (ICU)</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Surgical">Surgical Ward</option>
                  </select>
                </div>
              </div>

              {/* Bed No & Age/Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bed No (Optional)
                  </label>
                  <input
                    type="text"
                    value={admitForm.bed}
                    onChange={(e) => setAdmitForm({ ...admitForm, bed: e.target.value })}
                    placeholder="e.g. GW-08"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Age (Optional)
                  </label>
                  <input
                    type="number"
                    value={admitForm.age}
                    onChange={(e) => setAdmitForm({ ...admitForm, age: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Gender (Optional)
                  </label>
                  <select
                    value={admitForm.gender}
                    onChange={(e) => setAdmitForm({ ...admitForm, gender: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Diagnosis & Allergies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Clinical Diagnosis (Optional)
                  </label>
                  <input
                    type="text"
                    value={admitForm.diagnosis}
                    onChange={(e) => setAdmitForm({ ...admitForm, diagnosis: e.target.value })}
                    placeholder="e.g. Observation"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Known Allergies (Optional)
                  </label>
                  <input
                    type="text"
                    value={admitForm.allergies}
                    onChange={(e) => setAdmitForm({ ...admitForm, allergies: e.target.value })}
                    placeholder="e.g. Penicillin, Sulfa"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={admitLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-600 via-sky-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-md shadow-brand-600/25 transition-all hover-lift flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{admitLoading ? 'Saving to Database...' : 'Save Patient to Database'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
