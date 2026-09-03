import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Stethoscope, ClipboardList, Clock, Zap, CheckCircle, 
  BarChart3, Shield, Package, Activity, FileText, AlertOctagon 
} from 'lucide-react';

export function Sidebar({ currentView, onViewChange }) {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'DOCTOR';

  const doctorNav = [
    { id: 'doctor-patients', label: 'Patient Directory', icon: Users, desc: 'Profiles, vitals & allergies' },
    { id: 'doctor-prescribe', label: 'Create Prescription', icon: Stethoscope, desc: 'Auto-schedule generator' },
    { id: 'audit-log', label: 'Clinical Audit Trail', icon: Shield, desc: 'Traceable action history' },
  ];

  const nurseNav = [
    { id: 'nurse-schedule', label: 'Medication Tasks', icon: ClipboardList, desc: '5-Rights administration' },
    { id: 'nurse-patients', label: 'Ward Patients', icon: Users, desc: 'Bedside QR codes' },
    { id: 'audit-log', label: 'Medication History', icon: Shield, desc: 'Administered records' },
  ];

  const adminNav = [
    { id: 'admin-overview', label: 'Hospital Overview', icon: BarChart3, desc: 'Real-time KPIs & charts' },
    { id: 'admin-patients', label: 'Inpatient Admissions', icon: Users, desc: 'Admit, track arrival & phases' },
    { id: 'audit-log', label: 'Traceable Audit Log', icon: Shield, desc: 'Full actor accountability' },
    { id: 'pharmacy-stock', label: 'Pharmacy Inventory', icon: Package, desc: 'Stock levels & orders' },
  ];

  const pharmacistNav = [
    { id: 'pharmacy-orders', label: 'Dispensing Queue', icon: ClipboardList, desc: 'Active Rx requirements' },
    { id: 'pharmacy-stock', label: 'Medication Inventory', icon: Package, desc: 'Stock & reorder levels' },
    { id: 'audit-log', label: 'Dispense Audit Log', icon: Shield, desc: 'Traceable supply log' },
  ];

  let navItems = doctorNav;
  if (role === 'NURSE') navItems = nurseNav;
  if (role === 'ADMIN') navItems = adminNav;
  if (role === 'PHARMACIST') navItems = pharmacistNav;

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-md border-r border-slate-200/80 flex-shrink-0 flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-4rem)] select-none">
      <div>
        {/* Role Badge Indicator */}
        <div className="px-2 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80 shadow-subtle">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                Active Terminal
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-tight text-slate-800">{role} PORTAL</span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1 px-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-teal-600 text-white shadow-md shadow-brand-600/25 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs block truncate">{item.label}</span>
                  <span className={`text-[10px] block truncate ${isActive ? 'text-brand-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Safety Compliance Footnote */}
      <div className="px-2 pt-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/90 to-teal-50/70 border border-sky-200/70 text-left shadow-subtle">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-sky-950 mb-1">
            <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>5-Rights Safety Core</span>
          </div>
          <p className="text-[10px] text-sky-800/90 leading-tight">
            Bedside QR verification active. Clinically audited per NABH & JCI medication standards.
          </p>
        </div>
      </div>
    </aside>
  );
}

