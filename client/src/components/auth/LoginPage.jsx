import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pill, ShieldCheck, Stethoscope, HeartPulse, User, Lock, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const { login, DEFAULT_USERS } = useAuth();
  const [email, setEmail] = useState('doctor@smartmed.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleQuickLogin = (roleKey) => {
    const user = DEFAULT_USERS[roleKey];
    if (user) {
      setEmail(user.email);
      setPassword('password123');
      login(user.email, 'password123');
    }
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
          Med-<span className="bg-gradient-to-r from-brand-400 to-teal-400 bg-clip-text text-transparent">Sathi</span>
        </h2>
        <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SmartMedChart Enterprise eMAR</span>
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
                Hackathon Mode
              </span>
            </div>

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
                  <p className="text-[10px] text-slate-500 truncate">Doctor (Prescribe)</p>
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
                  <p className="text-[10px] text-slate-500 truncate">Nurse (eMAR)</p>
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
                  <p className="text-[10px] text-slate-500 truncate">Admin (Analytics)</p>
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
                  <p className="text-[10px] text-slate-500 truncate">Pharmacist (Supply)</p>
                </div>
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
    </div>
  );
}

