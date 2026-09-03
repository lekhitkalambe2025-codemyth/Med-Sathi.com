import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pill, ShieldCheck, Stethoscope, HeartPulse, User, Lock, ArrowRight, Activity, CheckCircle2, UserPlus, Plus, X, Sparkles } from 'lucide-react';

export function LoginPage() {
  const { login, registerStaff, demoUsers, DEFAULT_USERS } = useAuth();
  const [email, setEmail] = useState('doctor@smartmed.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Onboard Staff State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: 'DOCTOR',
    department: 'Cardiology & CCU',
    title: 'Consultant Physician',
    password: 'password123'
  });
  const [addStaffLoading, setAddStaffLoading] = useState(false);
  const [addStaffSuccess, setAddStaffSuccess] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleQuickLogin = (userOrRole) => {
    if (typeof userOrRole === 'string') {
      const user = DEFAULT_USERS[userOrRole];
      if (user) {
        setEmail(user.email);
        setPassword('password123');
        login(user.email, 'password123');
      }
    } else {
      // User object from demoUsers or registered
      setEmail(userOrRole.email);
      setPassword('password123');
      login(userOrRole.email, 'password123');
    }
  };

  const handleRegisterStaff = async (e) => {
    e?.preventDefault();
    if (!newStaff.name.trim() || !newStaff.email.trim()) return;

    setAddStaffLoading(true);
    setAddStaffSuccess('');
    setError('');

    const res = await registerStaff(newStaff);
    setAddStaffLoading(false);

    if (res.success) {
      setAddStaffSuccess(`Successfully registered ${newStaff.name}! Entering portal...`);
      setTimeout(() => {
        login(newStaff.email, newStaff.password);
      }, 800);
    } else {
      setError(res.error || 'Failed to register staff member.');
    }
  };

  const handlePresetStaff = (preset) => {
    setNewStaff(preset);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Subtle Background Glows & Medical Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-teal-500 text-white shadow-xl shadow-brand-500/30 mb-3.5 transform -rotate-3 hover:rotate-0 transition-transform">
          <Pill className="w-8 h-8 transform -rotate-45" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Med <span className="bg-gradient-to-r from-brand-400 to-teal-400 bg-clip-text text-transparent">Sathi</span>
        </h2>
        <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Med Sathi Enterprise eMAR</span>
        </div>
        <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Closed-Loop Digital Medication Chart & Bedside 5-Rights Verification System
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-200/90">
          
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hospital Email / Terminal ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@smartmed.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Security Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span>Remember this terminal</span>
              </label>
              <span className="text-brand-600 font-bold cursor-pointer hover:underline">Hospital SSO</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-sky-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 active:scale-[0.99] shadow-md shadow-brand-600/25 transition-all hover-lift"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Clinical Terminal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Persona Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                1-Click Quick Demo Personas
              </span>
              <span className="text-[10px] text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60">
                Hackathon Multi-Staff
              </span>
            </div>

            {/* Core Roles Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('DOCTOR')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:bg-blue-50/80 hover:border-blue-300 text-left transition-all hover-lift group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 font-extrabold text-xs shadow-xs">
                  DR
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-blue-900 truncate">Dr. Sharma</p>
                  <p className="text-[10px] text-slate-500 truncate">Internal Med (Physician)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('NURSE')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:bg-teal-50/80 hover:border-teal-300 text-left transition-all hover-lift group"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0 font-extrabold text-xs shadow-xs">
                  RN
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-teal-900 truncate">Nurse Priya</p>
                  <p className="text-[10px] text-slate-500 truncate">Ward Shift Lead (eMAR)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:bg-purple-50/80 hover:border-purple-300 text-left transition-all hover-lift group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0 font-extrabold text-xs shadow-xs">
                  AD
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-purple-900 truncate">Dr. Gupta</p>
                  <p className="text-[10px] text-slate-500 truncate">Chief Medical Officer</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('PHARMACIST')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:bg-amber-50/80 hover:border-amber-300 text-left transition-all hover-lift group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-extrabold text-xs shadow-xs">
                  RX
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-amber-900 truncate">Anil Verma</p>
                  <p className="text-[10px] text-slate-500 truncate">Chief Pharmacist</p>
                </div>
              </button>
            </div>

            {/* Additional Hospital Doctors & Nurses in System */}
            {demoUsers.length > 4 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                  Additional Department Doctors & Nurses:
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {demoUsers.slice(4).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200/70 bg-white hover:bg-slate-100/90 text-left transition-all"
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${
                        u.role === 'DOCTOR' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {u.role === 'DOCTOR' ? 'MD' : 'RN'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{u.name}</p>
                        <p className="text-[9px] text-slate-500 truncate">{u.department}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Prominent "+ Onboard New Doctor / Nurse / Staff" Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAddStaffModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-brand-400 bg-brand-50/70 hover:bg-brand-100/80 text-brand-800 text-xs font-bold transition-all shadow-subtle hover-lift"
              >
                <UserPlus className="w-4 h-4 text-brand-600" />
                <span>+ Add / Onboard New Doctor or Nurse</span>
              </button>
            </div>
          </div>

        </div>

        {/* Security & Compliance Footer */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>NABH & JCI 5-Rights Closed-Loop Architecture</span>
        </div>
      </div>

      {/* Hospital Staff Onboarding Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-400/30">
                  <UserPlus className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Onboard Hospital Staff</h3>
                  <p className="text-xs text-slate-400">Add a new Doctor, Nurse, Pharmacist, or Admin</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Click Demo Presets */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                1-Click Quick Fill Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetStaff({
                    name: 'Dr. Rajesh Patel',
                    email: 'dr.patel@medsathi.com',
                    role: 'DOCTOR',
                    department: 'Cardiology & CCU',
                    title: 'Consultant Cardiologist',
                    password: 'password123'
                  })}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-700 font-semibold text-slate-700 shadow-2xs transition-all"
                >
                  👨‍⚕️ + Dr. Rajesh Patel (Cardiology)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetStaff({
                    name: 'Nurse Anjali Sharma',
                    email: 'nurse.anjali@medsathi.com',
                    role: 'NURSE',
                    department: 'Intensive Care Unit (ICU)',
                    title: 'Lead Critical Care Nurse',
                    password: 'password123'
                  })}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 font-semibold text-slate-700 shadow-2xs transition-all"
                >
                  👩‍⚕️ + Nurse Anjali (ICU Lead)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetStaff({
                    name: 'Dr. Sunita Rao',
                    email: 'dr.sunita@medsathi.com',
                    role: 'DOCTOR',
                    department: 'Pediatrics',
                    title: 'Pediatric Specialist',
                    password: 'password123'
                  })}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-700 font-semibold text-slate-700 shadow-2xs transition-all"
                >
                  👩‍⚕️ + Dr. Sunita Rao (Pediatrics)
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegisterStaff} className="p-5 space-y-4">
              {addStaffSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{addStaffSuccess}</span>
                </div>
              )}

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Clinical Staff Role *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'DOCTOR', label: 'Doctor', icon: '👨‍⚕️' },
                    { key: 'NURSE', label: 'Nurse', icon: '👩‍⚕️' },
                    { key: 'PHARMACIST', label: 'Pharmacist', icon: '💊' },
                    { key: 'ADMIN', label: 'Admin', icon: '🛡️' }
                  ].map(r => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setNewStaff({ ...newStaff, role: r.key })}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        newStaff.role === r.key
                          ? 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-base mb-0.5">{r.icon}</span>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name & Title *
                  </label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    required
                    placeholder="e.g. Dr. Rajesh Patel"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Ward *
                  </label>
                  <input
                    type="text"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    required
                    placeholder="e.g. Cardiology & CCU"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Designation & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Clinical Designation
                  </label>
                  <input
                    type="text"
                    value={newStaff.title}
                    onChange={(e) => setNewStaff({ ...newStaff, title: e.target.value })}
                    placeholder="e.g. Consultant Physician"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hospital Email *
                  </label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    required
                    placeholder="e.g. dr.patel@medsathi.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Terminal Access Password
                </label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  placeholder="password123"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              {/* Submit & Cancel */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStaffLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-600 via-sky-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-md shadow-brand-600/25 transition-all hover-lift flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{addStaffLoading ? 'Registering Staff...' : 'Register & Log In'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

