// SmartMedChart API Client Services

const API_BASE = '/api';

async function fetchJson(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Network request failed');
  }
  return data;
}

export const api = {
  auth: {
    getDemoUsers: () => fetchJson('/auth/demo-users'),
    login: (email, password) => fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    register: (staffData) => fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify(staffData),
    }),
  },

  patients: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson(`/patients${query ? `?${query}` : ''}`);
    },
    getById: (id) => fetchJson(`/patients/${id}`),
    create: (patientData) => fetchJson('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    }),
    updatePhase: (id, phase) => fetchJson(`/patients/${id}/phase`, {
      method: 'PATCH',
      body: JSON.stringify({ arrivalPhase: phase }),
    }),
  },

  prescriptions: {
    create: (prescriptionData) => fetchJson('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    }),
    previewSchedule: (previewData) => fetchJson('/prescriptions/preview-schedule', {
      method: 'POST',
      body: JSON.stringify(previewData),
    }),
    safetyCheck: (checkData) => fetchJson('/prescriptions/safety-check', {
      method: 'POST',
      body: JSON.stringify(checkData),
    }),
    stop: (id, stopData) => fetchJson(`/prescriptions/${id}/stop`, {
      method: 'POST',
      body: JSON.stringify(stopData),
    }),
    update: (id, updateData) => fetchJson(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),
  },

  medications: {
    getSchedules: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson(`/medications${query ? `?${query}` : ''}`);
    },
    verifyQr: (verifyData) => fetchJson('/medications/verify-qr', {
      method: 'POST',
      body: JSON.stringify(verifyData),
    }),
    administer: (adminData) => fetchJson('/medications/administer', {
      method: 'POST',
      body: JSON.stringify(adminData),
    }),
  },

  analytics: {
    getHospitalOverview: () => fetchJson('/analytics/hospital-overview'),
  },

  audit: {
    getLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson(`/audit${query ? `?${query}` : ''}`);
    },
  },

  pharmacy: {
    getInventory: () => fetchJson('/pharmacy/inventory'),
    getOrders: () => fetchJson('/pharmacy/orders'),
  },

  aiRisk: {
    predict: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetchJson(`/ai-risk/predict${query ? `?${query}` : ''}`);
    },
  },
};
