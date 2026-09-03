import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RoleBadge } from '../common/Badge';
import { 
  Shield, Search, Filter, Download, RefreshCw, Calendar, 
  FileText, CheckCircle2, AlertTriangle, Stethoscope 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function AuditLogView() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const fetchLogs = () => {
    setLoading(true);
    api.audit.getLogs({ role: selectedRole, search })
      .then(res => setLogs(res.data || []))
      .catch(err => console.error('Error fetching audit logs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedRole, search]);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `smartmedchart_audit_log_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Audit log JSON exported successfully', 'success');
  };

  const getActionBadge = (action) => {
    const a = (action || '').toUpperCase();
    if (a.includes('CREATED')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (a.includes('ADMINISTERED') || a.includes('GIVEN')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (a.includes('STOPPED')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (a.includes('MODIFIED')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (a.includes('STAT')) return 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Traceable Clinical Audit Trail & Event Stream
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable log of all clinical prescriptions, bedside administrations, dose changes, and physician overrides
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
            <span>Refresh Stream</span>
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Audit Log Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search user, patient, drug, or detail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Clinical Roles</option>
              <option value="DOCTOR">Doctor Actions</option>
              <option value="NURSE">Nurse Administrations</option>
              <option value="ADMIN">Admin Activities</option>
              <option value="PHARMACIST">Pharmacist Activities</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Clinical Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Patient</th>
                <th className="py-3 px-4">Medication</th>
                <th className="py-3 px-4">Audit Trace Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    Loading audit trail events...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No audit records match the selected filters.
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const dt = new Date(log.timestamp);
                  const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateStr = dt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">{timeStr}</span>
                        <span>{dateStr}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {log.userName}
                      </td>
                      <td className="py-3.5 px-4">
                        <RoleBadge role={log.userRole} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {log.patientName || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {log.medicineName || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-md">
                        <p className="leading-snug text-xs">{log.details}</p>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {log.id}</span>
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
  );
}

