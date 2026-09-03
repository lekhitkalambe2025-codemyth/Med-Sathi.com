import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { StatBanner } from './components/layout/StatBanner';
import { LoginPage } from './components/auth/LoginPage';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { PatientProfile } from './components/doctor/PatientProfile';
import { NurseDashboard } from './components/nurse/NurseDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuditLogView } from './components/admin/AuditLogView';
import { PharmacistDashboard } from './components/pharmacist/PharmacistDashboard';
import { AiDelayRiskModal } from './components/ai/AiDelayRiskModal';
import CodeBlueModal from './components/emergency/CodeBlueModal';
import ClinicalChatbot from './components/common/ClinicalChatbot';

export function App() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState('default');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [codeBlueOpen, setCodeBlueOpen] = useState(false);
  const [patients, setPatients] = useState([]);

  // Fetch hospital inpatients for global modals (Code Blue, Chatbot)
  useEffect(() => {
    if (currentUser) {
      api.patients.getAll()
        .then(res => setPatients(res.data || []))
        .catch(() => {});
    }
  }, [currentUser]);

  // Sync default view whenever the logged in user or role changes
  useEffect(() => {
    if (!currentUser) return;
    const role = currentUser.role;
    if (role === 'DOCTOR') setCurrentView('doctor-patients');
    else if (role === 'NURSE') setCurrentView('nurse-schedule');
    else if (role === 'ADMIN') setCurrentView('admin-overview');
    else if (role === 'PHARMACIST') setCurrentView('pharmacy-orders');
    setSelectedPatientId(null);
  }, [currentUser?.role]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
  };

  const handleBackToPatients = () => {
    setSelectedPatientId(null);
  };

  const handleNavigateToStat = () => {
    setCurrentView('nurse-schedule');
  };

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col selection:bg-brand-500 selection:text-white relative">
      
      {/* Top Urgent STAT Alert Banner */}
      <StatBanner onNavigateToStat={handleNavigateToStat} />

      {/* Top Navigation Bar with Code Blue Trigger */}
      <Navbar 
        onOpenAiModal={() => setAiModalOpen(true)} 
        onOpenCodeBlue={() => setCodeBlueOpen(true)}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Sidebar Navigation */}
        <Sidebar 
          currentView={selectedPatientId ? 'doctor-patients' : currentView} 
          onViewChange={(viewId) => {
            setCurrentView(viewId);
            setSelectedPatientId(null);
          }} 
        />

        {/* Dynamic Main Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          
          {/* Patient Profile View (Dr/Nurse drill-down) */}
          {selectedPatientId ? (
            <PatientProfile
              patientId={selectedPatientId}
              onBack={handleBackToPatients}
            />
          ) : (
            <>
              {/* Doctor Views */}
              {(currentView === 'doctor-patients' || currentView === 'doctor-prescribe') && (
                <DoctorDashboard
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {/* Nurse Views */}
              {currentView === 'nurse-schedule' && (
                <NurseDashboard
                  onSelectPatientProfile={handleSelectPatient}
                />
              )}
              {currentView === 'nurse-patients' && (
                <DoctorDashboard
                  onSelectPatient={handleSelectPatient}
                />
              )}

              {/* Admin Views */}
              {currentView === 'admin-overview' && (
                <AdminDashboard
                  onNavigateToAudit={() => setCurrentView('audit-log')}
                />
              )}

              {/* Audit Log View (Cross-role accessible) */}
              {currentView === 'audit-log' && (
                <AuditLogView />
              )}

              {/* Pharmacy Views */}
              {(currentView === 'pharmacy-orders' || currentView === 'pharmacy-stock') && (
                <PharmacistDashboard />
              )}
            </>
          )}

        </main>

      </div>

      {/* AI Delay Risk Heuristic Decision-Support Prototype Modal */}
      <AiDelayRiskModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      {/* Code Blue Emergency Resuscitation Console Modal */}
      <CodeBlueModal
        isOpen={codeBlueOpen}
        onClose={() => setCodeBlueOpen(false)}
        patients={patients}
        currentUser={currentUser}
      />

      {/* Floating Med-Sathi Clinical AI Copilot Chatbot */}
      <ClinicalChatbot
        currentUser={currentUser}
        patients={patients}
      />

    </div>
  );
}

export default App;

