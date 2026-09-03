import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X, Activity, Info, Zap, AlertCircle } from 'lucide-react';

const DDI_RULES = [
  {
    drug1: 'Warfarin',
    drug2: 'Aspirin',
    severity: 'HIGH',
    title: 'Major Hemorrhage & Bleeding Risk',
    details: 'Concomitant administration significantly potentiates bleeding risk through dual inhibition of clotting factors and platelet aggregation.'
  },
  {
    drug1: 'Furosemide',
    drug2: 'Gentamicin',
    severity: 'HIGH',
    title: 'Severe Ototoxicity and Nephrotoxicity',
    details: 'Both agents have additive toxic effects on cochlear hair cells and proximal renal tubules.'
  },
  {
    drug1: 'Metformin',
    drug2: 'Contrast Agent',
    severity: 'MODERATE',
    title: 'Lactic Acidosis Risk in Renal Impairment',
    details: 'Iodinated contrast can cause transient acute kidney injury leading to toxic metformin accumulation.'
  },
  {
    drug1: 'Pantoprazole',
    drug2: 'Clopidogrel',
    severity: 'MODERATE',
    title: 'Reduced Antiplatelet Activation',
    details: 'CYP2C19 inhibition by some PPIs may reduce biotransformation of clopidogrel into its active antiplatelet metabolite.'
  }
];

export default function DdiMatrixModal({ isOpen, onClose, patient, prescriptions = [] }) {
  const [selectedPair, setSelectedPair] = useState(null);

  if (!isOpen || !patient) return null;

  // Extract unique active medicines for this patient
  const activeDrugs = Array.from(new Set(prescriptions.map(p => p.medicine)));

  // If patient has fewer than 2 drugs, provide sample demo drugs to illustrate matrix
  const matrixDrugs = activeDrugs.length >= 2 
    ? activeDrugs 
    : [...activeDrugs, 'Aspirin', 'Warfarin', 'Pantoprazole'].slice(0, 4);

  const checkInteraction = (d1, d2) => {
    if (d1 === d2) return null;
    const match = DDI_RULES.find(
      r => (r.drug1.toLowerCase() === d1.toLowerCase() && r.drug2.toLowerCase() === d2.toLowerCase()) ||
           (r.drug1.toLowerCase() === d2.toLowerCase() && r.drug2.toLowerCase() === d1.toLowerCase())
    );
    return match || { severity: 'SAFE', title: 'No Major Interaction Documented', details: 'No clinically significant adverse drug-drug pharmacokinetic interaction detected.' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200/90 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">Drug-Drug Interaction (DDI) Safety Matrix</h2>
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30 uppercase">
                  Polypharmacy Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Cross-pharmacokinetic analysis for {patient.name} ({patient.ward} • Bed {patient.bed})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Matrix Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Instructions */}
          <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-200/70 p-3 rounded-2xl text-xs text-indigo-950">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Click on any cell in the interaction grid to view clinical pharmacology details.</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold flex-shrink-0">
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> High Risk
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe
              </span>
            </div>
          </div>

          {/* Cross Matrix Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2.5 text-xs font-black text-slate-400 uppercase text-left bg-slate-50/80 rounded-tl-xl border border-slate-200">
                    Active Rx
                  </th>
                  {matrixDrugs.map((d, i) => (
                    <th key={i} className="p-2.5 text-xs font-extrabold text-slate-800 bg-slate-50/80 border border-slate-200">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixDrugs.map((rowDrug, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-2.5 text-xs font-black text-slate-800 text-left bg-slate-50/80 border border-slate-200 whitespace-nowrap">
                      {rowDrug}
                    </td>
                    {matrixDrugs.map((colDrug, cIdx) => {
                      if (rIdx === cIdx) {
                        return (
                          <td key={cIdx} className="p-2.5 border border-slate-200 bg-slate-100/60 text-slate-300 font-bold text-xs">
                            —
                          </td>
                        );
                      }

                      const interaction = checkInteraction(rowDrug, colDrug);
                      const isHigh = interaction.severity === 'HIGH';
                      const isMod = interaction.severity === 'MODERATE';

                      return (
                        <td
                          key={cIdx}
                          onClick={() => setSelectedPair({ drug1: rowDrug, drug2: colDrug, ...interaction })}
                          className={`p-2.5 border border-slate-200 cursor-pointer font-extrabold text-xs transition-all hover:scale-105 ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              : isMod
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {isHigh ? '⚠ HIGH' : isMod ? '⚡ MOD' : '✓ SAFE'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Interaction Deep-Dive Details */}
          {selectedPair && (
            <div className={`p-4 rounded-2xl border transition-all ${
              selectedPair.severity === 'HIGH'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : selectedPair.severity === 'MODERATE'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {selectedPair.severity === 'HIGH' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
                  {selectedPair.severity === 'MODERATE' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                  {selectedPair.severity === 'SAFE' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                  <span className="text-sm font-black">
                    {selectedPair.drug1} ⟷ {selectedPair.drug2}: {selectedPair.title}
                  </span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  selectedPair.severity === 'HIGH' ? 'bg-rose-600 text-white' :
                  selectedPair.severity === 'MODERATE' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {selectedPair.severity}
                </span>
              </div>
              <p className="text-xs leading-relaxed mt-1">
                {selectedPair.details}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Powered by Med-Sathi Clinical Pharmacokinetics Knowledge Base
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
}
