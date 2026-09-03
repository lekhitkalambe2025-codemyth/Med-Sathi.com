import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_USERS = {
  DOCTOR: {
    id: 'USR-DOC-01',
    name: 'Dr. Rajesh Sharma',
    email: 'doctor@smartmed.com',
    role: 'DOCTOR',
    title: 'Senior Consultant Physician',
    department: 'Internal Medicine',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  NURSE: {
    id: 'USR-NURSE-01',
    name: 'Nurse Priya Patel',
    email: 'nurse@smartmed.com',
    role: 'NURSE',
    title: 'Senior Staff Nurse (Shift Lead)',
    department: 'General & Surgical Wards',
    avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80'
  },
  ADMIN: {
    id: 'USR-ADMIN-01',
    name: 'Dr. Amitabh Gupta',
    email: 'admin@smartmed.com',
    role: 'ADMIN',
    title: 'Chief Medical Officer / Quality Director',
    department: 'Hospital Administration',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'
  },
  PHARMACIST: {
    id: 'USR-PHARM-01',
    name: 'Pharmacist Anil Verma',
    email: 'pharmacist@smartmed.com',
    role: 'PHARMACIST',
    title: 'Head of Inpatient Pharmacy',
    department: 'Central Pharmacy Services',
    avatar: 'https://images.unsplash.com/photo-1583912267670-6575ad472688?w=150&auto=format&fit=crop&q=80'
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smartmed_user');
    return saved ? JSON.parse(saved) : DEFAULT_USERS.DOCTOR;
  });

  const [demoUsers, setDemoUsers] = useState([]);

  useEffect(() => {
    api.auth.getDemoUsers()
      .then(res => {
        if (res.data && res.data.length > 0) {
          setDemoUsers(res.data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch demo users list, using defaults', err);
      });
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      setCurrentUser(res.user);
      localStorage.setItem('smartmed_user', JSON.stringify(res.user));
      return { success: true };
    } catch (err) {
      // Fallback matching for demo reliability
      const matched = Object.values(DEFAULT_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        localStorage.setItem('smartmed_user', JSON.stringify(matched));
        return { success: true };
      }
      return { success: false, error: err.message };
    }
  };

  const switchRole = (roleKey) => {
    const target = DEFAULT_USERS[roleKey] || DEFAULT_USERS.DOCTOR;
    setCurrentUser(target);
    localStorage.setItem('smartmed_user', JSON.stringify(target));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smartmed_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, switchRole, logout, demoUsers, DEFAULT_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

