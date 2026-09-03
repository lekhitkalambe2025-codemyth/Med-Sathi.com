import React, { useState } from 'react';
import { Heart, Clock, CheckCircle2, ShieldCheck, Languages, X, Calendar, User, Sparkles } from 'lucide-react';

const DRUG_EXPLANATIONS = {
  'Paracetamol': {
    en: { purpose: 'Fever and body pain relief', advice: 'Helps keep your temperature normal and relieves joint or body ache.' },
    hi: { purpose: 'बुखार और शरीर दर्द से राहत', advice: 'यह आपके शरीर का तापमान सामान्य रखने और दर्द कम करने में मदद करता है।' }
  },
  'Pantoprazole': {
    en: { purpose: 'Stomach acidity & ulcer protection', advice: 'Protects your stomach lining from strong medications and indigestion.' },
    hi: { purpose: 'पेट में गैस और एसिडिटी से सुरक्षा', advice: 'यह आपके पेट में जलन और भारी दवाओं से होने वाले एसिड को रोकता है।' }
  },
  'Ceftriaxone': {
    en: { purpose: 'High-strength antibiotic for infection', advice: 'Fights bacterial infection and helps your body heal rapidly.' },
    hi: { purpose: 'संक्रमण (इन्फेक्शन) रोकने वाला एंटीबायोटिक', advice: 'यह बैक्टीरिया के संक्रमण को खत्म करके तेजी से ठीक होने में मदद करता है।' }
  },
  'Furosemide': {
    en: { purpose: 'Reduces fluid swelling & regulates blood pressure', advice: 'Helps your kidneys remove excess fluid from your lungs and feet.' },
    hi: { purpose: 'सूजन कम करने और ब्लड प्रेशर संतुलन', advice: 'यह फेफड़ों और पैरों में जमा अतिरिक्त पानी निकालने में मदद करता है।' }
  },
  'Metformin': {
    en: { purpose: 'Blood sugar regulation', advice: 'Keeps your blood glucose stable after meals.' },
    hi: { purpose: 'ब्लड शुगर नियंत्रण', advice: 'यह भोजन के बाद आपके शरीर में शुगर का स्तर संतुलित रखता है।' }
  },
  'Amoxicillin': {
    en: { purpose: 'Antibiotic defense', advice: 'Eliminates bacteria in chest, throat, or wound.' },
    hi: { purpose: 'एंटीबायोटिक सुरक्षा', advice: 'यह छाती, गले या घाव के बैक्टीरिया को खत्म करता है।' }
  }
};

export default function PatientCompanionModal({ isOpen, onClose, patient, schedules = [] }) {
  const [lang, setLang] = useState('en'); // 'en' or 'hi'

  if (!isOpen || !patient) return null;

  const patientSchedules = schedules.filter(s => s.patientId === patient.id);

  const t = {
    en: {
      title: 'Med-Sathi Patient Care Companion',
      subtitle: 'Bedside transparent medication tracker for patients & families',
      patientInfo: 'Patient Details',
      bed: 'Bed',
      ward: 'Ward',
      safetyNote: 'All medications are verified with bedside 5-Rights barcodes before administration.',
      givenStatus: 'Administered by Nurse',
      dueStatus: 'Scheduled Round',
      nextDose: 'Next Round Due',
      nurse: 'Attending Nurse',
      close: 'Close Window'
    },
    hi: {
      title: 'मेड-साथी मरीज़ देखभाल साथी',
      subtitle: 'मरीज़ों और परिजनों के लिए पारदर्शी दवा ट्रैकर',
      patientInfo: 'मरीज़ का विवरण',
      bed: 'बिस्तर (बेड)',
      ward: 'वार्ड',
      safetyNote: 'सभी दवाइयां देने से पहले बारकोड और 5-अधिकार सुरक्षा नियमों से जांची जाती हैं।',
      givenStatus: 'नर्स द्वारा दी गई',
      dueStatus: 'आगामी समय',
      nextDose: 'अगली खुराक का समय',
      nurse: 'देखभाल नर्स',
      close: 'बंद करें'
    }
  }[lang];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200/90 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Warm Empathetic Header */}
        <div className="bg-gradient-to-r from-teal-600 via-brand-600 to-sky-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Heart className="w-6 h-6 text-rose-200 fill-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">{t.title}</h2>
              </div>
              <p className="text-xs text-brand-100 font-medium">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'हिंदी में देखें' : 'English View'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-black/15 hover:bg-black/25 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Patient Profile Card */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 font-black flex items-center justify-center text-sm">
              {patient.name.charAt(0)}
            </div>
            <div>
              <span className="font-extrabold text-slate-900 block text-sm">{patient.name}</span>
              <span className="text-slate-500 font-medium">
                {t.ward}: <strong>{patient.ward}</strong> • {t.bed}: <strong>{patient.bed}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200/80 text-[11px] font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>5-Rights Verified Bedside</span>
          </div>
        </div>

        {/* Medication Schedule Timeline */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
            {lang === 'en' ? "Today's Medication Care Plan" : 'आज की दवाइयों की समय-सारिणी'}
          </span>

          {patientSchedules.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No medications scheduled at this moment.
            </div>
          ) : (
            patientSchedules.map(item => {
              const info = DRUG_EXPLANATIONS[item.medicine] 
                ? DRUG_EXPLANATIONS[item.medicine][lang]
                : {
                    purpose: lang === 'en' ? 'Prescribed therapeutic medicine' : 'डॉक्टर द्वारा अनुशंसित दवा',
                    advice: lang === 'en' ? 'Administered strictly under hospital protocol.' : 'अस्पताल सुरक्षा नियमों के अनुसार दी जा रही है।'
                  };

              const dt = new Date(item.scheduledTime);
              const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isGiven = item.status === 'GIVEN';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isGiven
                      ? 'bg-emerald-50/40 border-emerald-200/80'
                      : 'bg-white border-slate-200/90 shadow-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-slate-900 text-sm">{item.medicine}</span>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {item.dose}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">({item.route})</span>
                      </div>

                      {/* Layman Explanation */}
                      <p className="text-xs font-extrabold text-teal-800 flex items-center gap-1.5 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>{info.purpose}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        {info.advice}
                      </p>
                    </div>

                    {/* Status Pill */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono font-bold text-slate-700 mb-1">
                        {timeStr}
                      </div>
                      {isGiven ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{t.givenStatus}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-full border border-sky-300">
                          <Clock className="w-3 h-3 text-sky-600" />
                          <span>{t.dueStatus}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Safety Footnote */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs">
          <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
            {t.safetyNote}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
}
