import React from 'react';

export function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();

  let dotColor = 'bg-slate-400';
  let styles = 'bg-slate-50 text-slate-700 border-slate-200';

  if (s === 'GIVEN') {
    dotColor = 'bg-emerald-500';
    styles = 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80 shadow-sm';
  } else if (s === 'DELAYED') {
    dotColor = 'bg-amber-500';
    styles = 'bg-amber-50/80 text-amber-800 border-amber-200/80 shadow-sm';
  } else if (s === 'OVERDUE') {
    dotColor = 'bg-rose-500 animate-pulse';
    styles = 'bg-rose-50/80 text-rose-800 border-rose-200/80 shadow-sm';
  } else if (s === 'DUE' || s === 'DUE NOW') {
    dotColor = 'bg-sky-500 animate-pulse';
    styles = 'bg-sky-50/90 text-sky-800 border-sky-200/90 font-semibold shadow-sm';
  } else if (s === 'UPCOMING') {
    dotColor = 'bg-slate-400';
    styles = 'bg-slate-50 text-slate-600 border-slate-200';
  } else if (s === 'HELD' || s === 'REFUSED' || s === 'NOT_GIVEN') {
    dotColor = 'bg-slate-500';
    styles = 'bg-slate-100 text-slate-700 border-slate-300';
  } else if (s === 'ACTIVE') {
    dotColor = 'bg-teal-500';
    styles = 'bg-teal-50/80 text-teal-800 border-teal-200/80 font-medium shadow-sm';
  } else if (s === 'STOPPED') {
    dotColor = 'bg-slate-300';
    styles = 'bg-slate-50 text-slate-400 border-slate-200 line-through';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`}></span>
      <span>{status === 'DUE' ? 'Due Now' : status}</span>
    </span>
  );
}

export function StatBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-900 border border-purple-300/80 shadow-sm shadow-purple-500/10 animate-stat-urgent">
      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping flex-shrink-0"></span>
      <span>⚡ STAT</span>
    </span>
  );
}

export function AllergyBadge({ allergy }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold tracking-tight bg-rose-50 text-rose-800 border border-rose-200/80 shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
      <span>{allergy}</span>
    </span>
  );
}

export function RoleBadge({ role }) {
  const r = (role || '').toUpperCase();
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (r === 'DOCTOR') styles = 'bg-blue-50/90 text-blue-800 border-blue-200/80';
  if (r === 'NURSE') styles = 'bg-teal-50/90 text-teal-800 border-teal-200/80';
  if (r === 'ADMIN') styles = 'bg-purple-50/90 text-purple-800 border-purple-200/80';
  if (r === 'PHARMACIST') styles = 'bg-amber-50/90 text-amber-800 border-amber-200/80';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-subtle ${styles}`}>
      {role}
    </span>
  );
}

