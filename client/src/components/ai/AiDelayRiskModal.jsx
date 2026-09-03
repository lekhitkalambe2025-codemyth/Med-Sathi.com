import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { Sparkles, AlertTriangle, ShieldCheck, Activity, Layers, Clock, Info } from 'lucide-react';

export function AiDelayRiskModal({ isOpen, onClose }) {
  const [ward, setWard] = useState('General Ward');
  const [medicineName, setMedicineName] = useState('Paracetamol');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPrediction = () => {
    setLoading(true);
    api.aiRisk.predict({ ward, medicineName })
      .then(res => setPrediction(res))
      .catch(err => console.error('Error fetching AI risk:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchPrediction();
    }
  }, [isOpen, ward, medicineName]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Medication Delay Risk Telemetry" maxWidth="max-w-xl">
      <div className="space-y-5">
        
        {/* Prototype Clinical Disclaimer Box */}
        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-950 flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold text-indigo-900 block mb-0.5">
              Decision-Support Prototype (Research Telemetry)
            </span>
            <p className="text-indigo-800 leading-snug">
              This system uses historical ward scheduling telemetry and transparent heuristic rules to identify potential medication round bottlenecks. It does not make medical or clinical decisions.
            </p>
          </div>
        </div>

        {/* Ward & Medication Selector */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Ward
            </label>
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="General Ward">General Ward</option>
              <option value="ICU">Intensive Care Unit (ICU)</option>
              <option value="Surgical Ward">Surgical Ward</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatric Ward">Pediatric Ward</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medication Profile
            </label>
            <select
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Paracetamol">Paracetamol (Oral Standard)</option>
              <option value="Meropenem">Meropenem (IV Infusion)</option>
              <option value="Noradrenaline">Noradrenaline (IV Titrated)</option>
              <option value="Pantoprazole">Pantoprazole (Oral)</option>
              <option value="Furosemide">Furosemide (IV Diuretic)</option>
            </select>
          </div>
        </div>

        {/* Prediction Results */}
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs font-semibold">
            Analyzing shift telemetry and workload factors...
          </div>
        ) : prediction?.data ? (
          <div className="space-y-4">
            
            {/* Score Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              prediction.data.riskLevel === 'HIGH'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : prediction.data.riskLevel === 'MEDIUM'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                  Predicted Administration Delay Risk
                </span>
                <span className="text-xl font-extrabold mt-0.5 block">
                  {prediction.data.riskLevel} RISK ({prediction.data.riskScore}%)
                </span>
              </div>

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                prediction.data.riskLevel === 'HIGH'
                  ? 'bg-rose-600 text-white'
                  : prediction.data.riskLevel === 'MEDIUM'
                  ? 'bg-amber-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {prediction.data.riskScore}%
              </div>
            </div>

            {/* Contributing Factors Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">
                Identified Contributing Factors:
              </h4>
              <div className="space-y-2">
                {prediction.data.factors.map((factor, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700">
              <strong className="text-slate-900 block mb-0.5">Nursing Workflow Recommendation:</strong>
              <p>{prediction.data.recommendation}</p>
            </div>

          </div>
        ) : null}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Telemetry
          </button>
        </div>

      </div>
    </Modal>
  );
}

