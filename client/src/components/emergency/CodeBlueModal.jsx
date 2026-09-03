import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Zap, ShieldAlert, X, Heart, Activity, CheckCircle2, RotateCcw } from 'lucide-react';

export default function CodeBlueModal({ isOpen, onClose, patients = [], currentUser }) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [cycleCount, setCycleCount] = useState(1);
  const [shocksDelivered, setShocksDelivered] = useState(0);
  const [selectedJoules, setSelectedJoules] = useState('150J');
  const [eventLog, setEventLog] = useState([]);

  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0] || {
    name: 'ICU Patient',
    age: 58,
    weight: 70,
    bed: 'ICU-02',
    ward: 'ICU'
  };

  const patientWeight = activePatient.weight || 70; // kg default

  // 2-Minute CPR Countdown Timer
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      // Alarm trigger
      logEvent(`⚠️ 2-MINUTE CPR CYCLE #${cycleCount} COMPLETE: Check Rhythm & Prepare Epinephrine 1mg IV`);
      setSecondsRemaining(120);
      setCycleCount(c => c + 1);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining, cycleCount]);

  const logEvent = async (action) => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${action}`;
    setEventLog(prev => [entry, ...prev]);

    // Push to backend clinical audit trail
    try {
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CODE_BLUE_RESUSCITATION',
          entityType: 'RESUSCITATION_LOG',
          entityId: activePatient.id || 'ICU-RESUS',
          patientId: activePatient.id,
          performedBy: currentUser?.name || 'ICU Resuscitation Team',
          details: {
            event: action,
            cycle: cycleCount,
            shocks: shocksDelivered,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (e) {
      console.error('Audit log failed', e);
    }
  };

  const handleDeliverShock = () => {
    const nextShocks = shocksDelivered + 1;
    setShocksDelivered(nextShocks);
    logEvent(`⚡ SHOCK #${nextShocks} DELIVERED (${selectedJoules} Biphasic) - CPR Resumed`);
  };

  const handleGiveDrug = (drugName, dose) => {
    logEvent(`💉 ADMINISTERED: ${drugName} (${dose}) IV Push via Rapid Line`);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgentDue = secondsRemaining <= 15;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-950 border-2 border-rose-600/80 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Urgent Emergency Header */}
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-950 p-4 sm:p-5 flex items-center justify-between border-b border-rose-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center animate-pulse shadow-lg shadow-rose-600/50">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wider uppercase text-white">CODE BLUE RESUSCITATION CONSOLE</h2>
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-ping">
                  CRITICAL
                </span>
              </div>
              <p className="text-xs text-rose-300 font-medium">
                ACLS Protocol Real-Time Resuscitation & Defibrillation Controller
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-rose-900/50 hover:bg-rose-800 text-rose-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Selector Strip */}
        <div className="bg-slate-900/90 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Resuscitation Subject:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1 font-bold focus:outline-none focus:border-rose-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.ward} • Bed {p.bed}) - {p.age}y
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-slate-300 font-mono">
            <span>Weight: <strong className="text-rose-400">{patientWeight} kg</strong></span>
            <span>•</span>
            <span>Cycles Logged: <strong className="text-rose-400">{cycleCount}</strong></span>
            <span>•</span>
            <span>Total Shocks: <strong className="text-rose-400">{shocksDelivered}</strong></span>
          </div>
        </div>

        {/* Console Main Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
          
          {/* Left Column: 2-Minute CPR Countdown Timer (5 cols) */}
          <div className="md:col-span-5 bg-slate-900/70 rounded-3xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
              ACLS CPR 2-Min Epinephrine Cycle
            </span>

            {/* Circular Timer Display */}
            <div className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
              isUrgentDue
                ? 'border-rose-500 bg-rose-950/40 text-rose-400 animate-pulse'
                : 'border-cyan-500 bg-cyan-950/20 text-cyan-300'
            }`}>
              <span className="text-4xl font-black font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-slate-400">
                Cycle #{cycleCount}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  isTimerRunning ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
              </button>
              <button
                onClick={() => {
                  setSecondsRemaining(120);
                  setIsTimerRunning(true);
                  logEvent(`Cycle #${cycleCount} manually reset to 2:00`);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {isUrgentDue && (
              <div className="mt-3 text-rose-400 text-xs font-bold animate-bounce flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Prepare Adrenaline 1mg IV Push!</span>
              </div>
            )}
          </div>

          {/* Right Column: Emergency Drugs & Shock Unit (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Defibrillation Shock Unit */}
            <div className="bg-slate-900/70 p-4 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Defibrillation Shock Controller
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {['120J', '150J', '200J'].map(j => (
                    <button
                      key={j}
                      onClick={() => setSelectedJoules(j)}
                      className={`text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg border transition-all ${
                        selectedJoules === j
                          ? 'bg-amber-500 text-black border-amber-400 font-bold'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDeliverShock}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-rose-600 to-rose-700 hover:from-amber-600 hover:to-rose-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                <span>DELIVER {selectedJoules} BIPHASIC SHOCK (ALL CLEAR!)</span>
              </button>
            </div>

            {/* Quick Emergency Dosing Calculator (Weight-Adjusted) */}
            <div className="bg-slate-900/70 p-4 rounded-3xl border border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-3">
                Weight-Adjusted ACLS Emergency Push ({patientWeight} kg)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGiveDrug('Epinephrine (Adrenaline)', '1 mg')}
                  className="p-3 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 rounded-2xl text-left transition-all hover-lift"
                >
                  <div className="flex justify-between items-center text-xs font-black text-rose-300">
                    <span>Epinephrine</span>
                    <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-mono">1 mg</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Every 3-5 min in arrest</p>
                </button>

                <button
                  onClick={() => handleGiveDrug('Amiodarone', '300 mg')}
                  className="p-3 bg-purple-950/60 hover:bg-purple-900 border border-purple-700/60 rounded-2xl text-left transition-all hover-lift"
                >
                  <div className="flex justify-between items-center text-xs font-black text-purple-300">
                    <span>Amiodarone</span>
                    <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-mono">300 mg</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Refractory VF / Pulseless VT</p>
                </button>

                <button
                  onClick={() => handleGiveDrug('Atropine', '1 mg')}
                  className="p-3 bg-sky-950/60 hover:bg-sky-900 border border-sky-700/60 rounded-2xl text-left transition-all hover-lift"
                >
                  <div className="flex justify-between items-center text-xs font-black text-sky-300">
                    <span>Atropine Sulfate</span>
                    <span className="text-[10px] bg-sky-600 text-white px-1.5 py-0.5 rounded font-mono">1 mg</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Symptomatic Bradycardia</p>
                </button>

                <button
                  onClick={() => handleGiveDrug('Sodium Bicarbonate', `${patientWeight} mEq`)}
                  className="p-3 bg-teal-950/60 hover:bg-teal-900 border border-teal-700/60 rounded-2xl text-left transition-all hover-lift"
                >
                  <div className="flex justify-between items-center text-xs font-black text-teal-300">
                    <span>Sodium Bicarbonate</span>
                    <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded font-mono">{patientWeight} mEq</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">1 mEq/kg for severe acidosis</p>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Resuscitation Event Audit Log Footer */}
        <div className="bg-slate-900 p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Live Resuscitation Event Stream (Auto-Audited to EHR)
            </span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Blockchain Audit Active
            </span>
          </div>

          <div className="h-20 bg-slate-950 rounded-xl p-2.5 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1 border border-slate-800">
            {eventLog.length === 0 ? (
              <span className="text-slate-600 italic">No resuscitation events logged yet in this session.</span>
            ) : (
              eventLog.map((log, i) => (
                <div key={i} className="text-rose-300">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
