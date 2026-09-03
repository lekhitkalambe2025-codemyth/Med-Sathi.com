import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './Modal';
import { Download, Copy, Printer, Check, User, MapPin } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function QrCodeModal({ isOpen, onClose, patient }) {
  const { showToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!patient) return null;

  const qrValue = patient.qrCode || `SMARTMED:PATIENT:${patient.id}:${patient.uhid}:${patient.name}:${patient.bed}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    showToast('Patient QR string copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Bedside QR Identifier" maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        {/* Patient Identity Header */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 text-left">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-slate-800 text-base">{patient.name}</h4>
            <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {patient.id}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">UHID: {patient.uhid} • {patient.age}y / {patient.gender}</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-700 pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              {patient.ward}
            </span>
            <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-800 font-bold">
              Bed: {patient.bed}
            </span>
          </div>
        </div>

        {/* Crisp QR Code */}
        <div className="p-4 bg-white border-2 border-dashed border-slate-300 rounded-2xl shadow-inner mb-4">
          <QRCodeSVG
            value={qrValue}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">
          Scan this digital badge at the bedside with the Nurse Verification scanner to perform 5-Rights medication administration.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Data'}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Badge
          </button>
        </div>
      </div>
    </Modal>
  );
}

