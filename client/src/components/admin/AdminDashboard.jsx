import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  BarChart3, CheckCircle2, Clock, AlertCircle, Zap, Shield, 
  TrendingUp, RefreshCw, MapPin, Activity, HelpCircle 
} from 'lucide-react';

export function AdminDashboard({ onNavigateToAudit }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    api.analytics.getHospitalOverview()
      .then(res => setAnalyticsData(res.data))
      .catch(err => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !analyticsData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Computing Real-Time Hospital Analytics...</span>
        </div>
      </div>
    );
  }

  const { summary, statusDistribution, wardPerformance, delayReasons, hourlyTrends } = analyticsData;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Hospital Medication Overview & Clinical Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time compliance intelligence, ward performance benchmarks & delay telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
            <span>Recalculate</span>
          </button>

          <button
            onClick={onNavigateToAudit}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
          >
            <Shield className="w-4 h-4" />
            <span>Open Audit Trail</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Dynamic, Computed in real-time) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Medicines Due</span>
          <span className="text-2xl font-extrabold text-slate-900">{summary.dueToday}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Scheduled for shifts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <span className="text-[11px] font-bold uppercase text-emerald-700 block mb-1">Given on Time</span>
          <span className="text-2xl font-extrabold text-emerald-800">{summary.given}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Verified with QR</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/20">
          <span className="text-[11px] font-bold uppercase text-amber-700 block mb-1">Delayed</span>
          <span className="text-2xl font-extrabold text-amber-800">{summary.delayed}</span>
          <span className="text-[10px] text-amber-600 font-semibold block mt-1">Documented reason</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/20">
          <span className="text-[11px] font-bold uppercase text-rose-700 block mb-1">Missed / Overdue</span>
          <span className="text-2xl font-extrabold text-rose-800">{summary.overdue}</span>
          <span className="text-[10px] text-rose-600 font-semibold block mt-1">Requires follow-up</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-sm bg-purple-50/20">
          <span className="text-[11px] font-bold uppercase text-purple-700 block mb-1">Pending STAT</span>
          <span className="text-2xl font-extrabold text-purple-800">{summary.pendingStat}</span>
          <span className="text-[10px] text-purple-600 font-bold block mt-1">Urgent priority</span>
        </div>

        <div className="bg-gradient-to-tr from-brand-600 to-teal-600 p-4 rounded-2xl text-white shadow-md shadow-brand-600/20">
          <span className="text-[11px] font-bold uppercase text-brand-100 block mb-1">Compliance Rate</span>
          <span className="text-2xl font-black text-white">{summary.complianceRate}%</span>
          <span className="text-[10px] text-brand-100 font-semibold block mt-1">Target: &gt; 90%</span>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Status Distribution Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Medication Administration Status Distribution
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Live Snapshot</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [`${val} Doses`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 24h Hourly Compliance Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Shift Medication Compliance Trend vs Target (95%)
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Target 95%
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrends}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  formatter={(val) => [`${val}%`, 'Compliance']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#compGrad)" name="Actual Compliance %" />
                <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} name="Benchmark (95%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Ward Performance Table & Delay Reasons Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ward Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              Ward-Wise Medication Performance Benchmarks
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Updated Real-Time</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Hospital Ward</th>
                  <th className="py-3 px-3 text-center">Due / Active</th>
                  <th className="py-3 px-3 text-center">Given</th>
                  <th className="py-3 px-3 text-center">Delayed</th>
                  <th className="py-3 px-3 text-center">Missed</th>
                  <th className="py-3 px-4 text-right">Compliance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wardPerformance.map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {w.ward}
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-600">
                      {w.due}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                      {w.given}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-amber-700">
                      {w.delayed}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-rose-700">
                      {w.missed}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-block font-extrabold px-2 py-0.5 rounded text-xs ${
                        w.compliance >= 90
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : w.compliance >= 75
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {w.compliance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delay Root Causes Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
              Documented Delay Root Causes
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Telemetry aggregated from nurse shift administration entries
            </p>

            <div className="space-y-3">
              {delayReasons.map((dr, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{dr.reason}</span>
                    <span className="text-[10px] text-slate-400">Clinical documentation</span>
                  </div>
                  <span className="text-xs font-extrabold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg">
                    {dr.count} occurrences
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 leading-tight block">
              Audited according to JCI / NABH Digital Medication Safety Standards.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

