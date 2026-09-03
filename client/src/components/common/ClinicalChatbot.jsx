import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, AlertCircle, CheckCircle2, ChevronDown, User, ShieldCheck } from 'lucide-react';

const CLINICAL_KNOWLEDGE = [
  {
    keywords: ['5 right', 'five right', 'rights', 'safety checklist'],
    response: `**The 5-Rights of Medication Administration:**
1. **Right Patient:** Verify bedside 2-factor ID & QR barcode.
2. **Right Drug:** Double-check generic/brand matching and allergy flags.
3. **Right Dose:** Validate standard ranges and weight-adjusted pediatric/renal bounds.
4. **Right Route:** Confirm IV, Oral, IM, SC, or Topical route.
5. **Right Time:** Administer within the ±30 min hospital accreditation window.

*Med-Sathi automatically audits all 5 rights before unlocking administration.*`
  },
  {
    keywords: ['stat', 'emergency', 'urgent'],
    response: `**STAT Medication Protocol (NABH/JCI Standard):**
* STAT orders indicate immediate clinical necessity (within 15 minutes).
* When a doctor prescribes STAT, an audio-visual alert triggers across nursing terminals.
* In Med-Sathi, STAT tasks bypass routine ward queues and appear in the top emergency banner.`
  },
  {
    keywords: ['warfarin', 'aspirin', 'interaction', 'ddi', 'bleeding'],
    response: `⚠️ **High-Risk Polypharmacy Alert: Warfarin + Aspirin**
* **Mechanism:** Additive anti-platelet and anti-coagulation inhibition.
* **Clinical Consequence:** Severe gastrointestinal and intracranial hemorrhage risk.
* **Recommendation:** Avoid co-administration unless specifically indicated with regular INR monitoring and gastroprotective PPI cover (e.g. Pantoprazole).`
  },
  {
    keywords: ['paracetamol', 'crocin', 'acetaminophen', 'dose'],
    response: `💊 **Paracetamol (Acetaminophen) Clinical Reference:**
* **Adult Inpatient:** 500mg - 1000mg PO/IV every 6 to 8 hours (Max: 4000mg/24h).
* **Pediatric:** 15 mg/kg per dose PO every 4–6 hours (Max: 60 mg/kg/day).
* **Hepatic Caution:** Reduce dose to max 2000mg/day in cirrhosis or chronic alcoholism.`
  },
  {
    keywords: ['ceftriaxone', 'antibiotic', 'renal'],
    response: `💉 **Ceftriaxone 3rd Gen Cephalosporin:**
* **Standard Adult Dose:** 1g to 2g IV once daily (OD) or divided BD in severe sepsis.
* **Allergy Cross-Reactivity:** Caution in confirmed anaphylactic Penicillin allergy (~2-3% cross-reactivity).
* **Renal Adjustment:** No adjustment needed unless both severe renal AND hepatic impairment coexist.`
  },
  {
    keywords: ['delay', 'ai risk', 'prediction'],
    response: `🧠 **Med-Sathi AI Delay Risk Engine:**
Our heuristic telemetry analyzes:
1. Ward nurse-to-patient census ratio
2. Concurrent pending doses in current 60-minute window
3. Emergency STAT interruptions
4. High-risk medication double-sign requirements

*Doses with >60% projected delay risk are flagged in orange for proactive staffing reallocation.*`
  }
];

export default function ClinicalChatbot({ currentUser, patients = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${currentUser?.name || 'Doctor'}! I am **Med-Sathi Clinical AI Copilot**. You can ask me about drug dosages, drug interactions, 5-Rights protocols, or current ward telemetry.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "What are the 5-Rights?",
    "Warfarin + Aspirin risk?",
    "STAT order protocol",
    "Paracetamol pediatric dose"
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (userText) => {
    const query = (userText || input).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = null;

      // Check current ward / patients state
      if (lower.includes('how many patient') || lower.includes('total patient')) {
        reply = `Currently, there are **${patients.length} inpatients** admitted across the General Ward, ICU, and Surgical units.`;
      } else if (lower.includes('icu')) {
        const icuPatients = patients.filter(p => p.ward?.toUpperCase().includes('ICU'));
        reply = `There are currently **${icuPatients.length} patients in the ICU**:\n` + 
          icuPatients.map(p => `• **${p.name}** (Bed ${p.bed})`).join('\n');
      } else {
        // Knowledge Base Matching
        for (const item of CLINICAL_KNOWLEDGE) {
          if (item.keywords.some(k => lower.includes(k))) {
            reply = item.response;
            break;
          }
        }
      }

      if (!reply) {
        reply = `I understand you are asking about: "${query}".\n\nAs a closed-loop clinical safety copilot, I recommend cross-verifying active prescriptions with our **5-Rights Bedside Scanner** and checking the **Patient Profile** for documented drug allergies and eGFR levels.`;
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Expanded Chat Drawer */}
      {isOpen ? (
        <div className="w-[360px] sm:w-[400px] h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black tracking-tight text-white">Med-Sathi Copilot</h3>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Clinical AI & Protocol Assistant</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Demo Prompts */}
          <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[10px] whitespace-nowrap font-bold px-2.5 py-1 rounded-full bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 text-slate-600 border border-slate-200/90 transition-all flex-shrink-0 shadow-subtle"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-teal-600 text-white rounded-br-none shadow-md shadow-brand-600/15'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/80 shadow-subtle'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">
                    {msg.text}
                  </div>
                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      msg.sender === 'user' ? 'text-brand-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-slate-400 text-[11px] italic">
                <Bot className="w-4 h-4 text-brand-600 animate-pulse" />
                <span>Med-Sathi AI is analyzing pharmacology...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask dosage, interactions, or 5-rights..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-brand-600/20 transition-all hover-lift"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      ) : (
        /* Floating Trigger Pill / Circle */
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-full shadow-2xl border border-slate-700/60 hover:shadow-brand-600/30 transition-all duration-300 hover-lift"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-xs group-hover:rotate-12 transition-transform">
            <Bot className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <span className="block text-xs font-black tracking-tight leading-none text-white">
              Med-Sathi AI
            </span>
            <span className="text-[10px] text-teal-400 font-bold leading-none">
              Clinical Copilot
            </span>
          </div>
          <span className="flex h-2 w-2 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      )}
    </div>
  );
}
