import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';
import { 
  Pill, Bell, LogOut, ChevronDown, UserCheck, ShieldCheck, 
  Stethoscope, Activity, Sparkles, CheckCheck
} from 'lucide-react';

export function Navbar({ onOpenAiModal }) {
  const { currentUser, switchRole, logout, DEFAULT_USERS } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, type: 'STAT', title: '⚡ STAT Order Issued', desc: 'Dr. Sharma ordered IV Hydrocortisone for Vikram Mehta (ICU-02)', time: '5m ago' },
    { id: 2, type: 'DUE', title: '⏰ Medication Round Active', desc: 'General Ward morning doses due for verification', time: '12m ago' },
    { id: 3, type: 'ALLERGY', title: '⚠ Allergy Profile Updated', desc: 'Rahul Sharma: Penicillin allergy confirmed by attending', time: '45m ago' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_10px_-2px_rgba(15,23,42,0.03)] transition-all">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-600 to-teal-500 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-500/20">
            <Pill className="w-5 h-5 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                Med-<span className="bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">Sathi</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100/90 text-slate-700 rounded-full border border-slate-200/90">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                eMAR Cloud
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 font-medium tracking-tight">SmartMedChart Closed-Loop Clinical Safety</p>
          </div>
        </div>

        {/* Right: Role Switcher, AI Prototype, Notifications, User Menu */}
        <div className="flex items-center gap-2.5">
          
          {/* AI Decision Support Button */}
          <button
            onClick={onOpenAiModal}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-50 to-indigo-50/80 hover:from-sky-100 hover:to-indigo-100 text-sky-900 border border-sky-200/80 shadow-sm transition-all hover-lift"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>AI Delay Risk</span>
          </button>

          {/* Persona / Role Switcher for Hackathon Demo */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50/90 hover:bg-slate-100 border border-slate-200/90 text-slate-700 transition-all shadow-subtle hover-lift"
              title="Quickly switch demo user role"
            >
              <UserCheck className="w-4 h-4 text-brand-600" />
              <span className="hidden sm:inline text-slate-500 text-[11px]">Role:</span>
              <RoleBadge role={currentUser?.role || 'DOCTOR'} />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Demo Persona (1-Click)
                </div>
                <div className="p-1.5 space-y-1">
                  {Object.entries(DEFAULT_USERS).map(([key, user]) => {
                    const isCurrent = currentUser?.role === user.role;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          switchRole(key);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                          isCurrent 
                            ? 'bg-brand-50/90 border border-brand-200/80 font-bold text-brand-900 shadow-xs' 
                            : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-semibold truncate">{user.name}</span>
                          <span className="text-[10px] text-slate-400 truncate">{user.title}</span>
                        </div>
                        <RoleBadge role={user.role} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100/90 border border-transparent hover:border-slate-200/80 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            {notifOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setNotifOpen(false)}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900">Hospital Live Telemetry</h4>
                  <span className="text-[10px] text-brand-600 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" /> Mark read
                  </span>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current User Info & Logout */}
          <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200">
            {currentUser?.avatar && currentUser.avatar.startsWith('http') ? (
              <img
                src={currentUser.avatar}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-200/80 shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-black text-xs flex items-center justify-center shadow-sm shadow-brand-500/20">
                {currentUser?.avatar || (currentUser?.name ? currentUser.name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'U')}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">{currentUser?.department}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}

