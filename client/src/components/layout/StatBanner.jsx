import React, { useEffect, useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function StatBanner({ onNavigateToStat }) {
  const [statOrders, setStatOrders] = useState([]);
  const { currentUser } = useAuth();

  const fetchStatOrders = () => {
    api.medications.getSchedules({ tab: 'STAT' })
      .then(res => {
        const pending = (res.data || []).filter(s => s.status === 'DUE' || s.status === 'OVERDUE');
        setStatOrders(pending);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStatOrders();
    const interval = setInterval(fetchStatOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!statOrders || statOrders.length === 0) return null;

  const first = statOrders[0];

  return (
    <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white px-4 sm:px-6 py-2.5 shadow-lg shadow-purple-950/20 border-b border-purple-800/40 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-purple-500/30 border border-purple-400/40 text-purple-200 font-black text-xs animate-stat-urgent shadow-glow-stat">
          ⚡
        </span>
        <div className="text-xs">
          <span className="font-extrabold tracking-wider uppercase text-purple-300 mr-2 bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-700/50">
            STAT Emergency Order
          </span>
          <span className="font-bold text-white">
            {first.patientName} <span className="text-purple-300 font-normal">(Bed {first.patientBed})</span>
          </span>
          <span className="mx-2 text-purple-400">•</span>
          <span className="text-purple-200 font-medium">
            {first.medicine} <strong className="text-white">{first.dose}</strong> ({first.route})
          </span>
          {statOrders.length > 1 && (
            <span className="ml-2.5 bg-purple-800/90 text-purple-200 px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-700/50">
              +{statOrders.length - 1} more pending
            </span>
          )}
        </div>
      </div>

      {currentUser?.role === 'NURSE' && (
        <button
          onClick={() => onNavigateToStat && onNavigateToStat()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-purple-50 text-purple-950 text-xs font-bold rounded-xl shadow-md transition-all hover-lift"
        >
          <span>Administer Now</span>
          <ArrowRight className="w-3.5 h-3.5 text-purple-700" />
        </button>
      )}
    </div>
  );
}

