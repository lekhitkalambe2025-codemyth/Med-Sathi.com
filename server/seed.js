const { db, initSchema } = require('./db');
const { generateScheduleEvents } = require('./scheduler');

function seedDatabase() {
  initSchema(true); // Reset and recreate with complete columns

  console.log('Seeding demo users...');
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, title, department, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    ['usr-doc-01', 'Dr. Rajesh Sharma', 'doctor@smartmed.com', 'password123', 'DOCTOR', 'Senior Consultant Physician', 'Internal Medicine', 'RS'],
    ['usr-nur-01', 'Nurse Priya Patel', 'nurse@smartmed.com', 'password123', 'NURSE', 'Senior Staff Nurse (RN)', 'General & Surgical Wards', 'PP'],
    ['usr-adm-01', 'Dr. Vikram Mehta', 'admin@smartmed.com', 'password123', 'ADMIN', 'Chief Medical Officer / Clinical Director', 'Hospital Administration', 'VM'],
    ['usr-phm-01', 'Ananya Roy', 'pharmacist@smartmed.com', 'password123', 'PHARMACIST', 'Lead Clinical Pharmacist', 'Hospital Pharmacy', 'AR'],
    ['usr-doc-02', 'Dr. Neha Verma', 'dr.neha@smartmed.com', 'password123', 'DOCTOR', 'Consultant Cardiologist', 'Cardiology', 'NV'],
    ['usr-nur-02', 'Nurse Anjali Gupta', 'nurse.anjali@smartmed.com', 'password123', 'NURSE', 'ICU Specialist Nurse', 'Intensive Care Unit (ICU)', 'AG'],
    ['usr-nur-03', 'Nurse Pooja Rao', 'nurse.pooja@smartmed.com', 'password123', 'NURSE', 'Ward Staff Nurse', 'General Ward', 'PR']
  ];

  for (const u of users) {
    insertUser.run(...u);
  }

  console.log('Seeding patients...');
  const insertPatient = db.prepare(`
    INSERT INTO patients (id, uhid, name, age, gender, weight, ward, bed, diagnosis, allergies, medicalHistory, vitals, admittedAt, qrCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const patients = [
    [
      'pat-1024',
      'P1024',
      'Rahul Sharma',
      54,
      'Male',
      72.0,
      'General Ward',
      'G-12',
      'Post-operative Inguinal Hernia Repair / Acute Somatic Pain',
      JSON.stringify(['Penicillin', 'Ampicillin']),
      JSON.stringify(['Hypertension (5 yrs)', 'GERD']),
      JSON.stringify({ bp: '128/82 mmHg', hr: '76 bpm', spo2: '98%', temp: '98.6 °F' }),
      `${todayStr}T08:00:00.000Z`,
      'SMARTMED:PATIENT:P1024:RAHUL_SHARMA:G12'
    ],
    [
      'pat-1025',
      'P1025',
      'Sunita Devi',
      62,
      'Female',
      65.5,
      'Cardiology',
      'C-04',
      'Congestive Heart Failure (NYHA Class II) / Essential HTN',
      JSON.stringify(['Sulfa Drugs']),
      JSON.stringify(['Type 2 Diabetes', 'Dyslipidemia']),
      JSON.stringify({ bp: '142/88 mmHg', hr: '82 bpm', spo2: '96%', temp: '98.4 °F' }),
      `${todayStr}T09:30:00.000Z`,
      'SMARTMED:PATIENT:P1025:SUNITA_DEVI:C04'
    ],
    [
      'pat-1026',
      'P1026',
      'Vikram Malhotra',
      45,
      'Male',
      81.0,
      'ICU',
      'ICU-02',
      'Community-Acquired Severe Pneumonia with Sepsis',
      JSON.stringify(['NSAIDs', 'Aspirin']),
      JSON.stringify(['Asthma', 'Smoker']),
      JSON.stringify({ bp: '105/65 mmHg', hr: '110 bpm', spo2: '93%', temp: '101.2 °F' }),
      `${todayStr}T04:15:00.000Z`,
      'SMARTMED:PATIENT:P1026:VIKRAM_MALHOTRA:ICU02'
    ],
    [
      'pat-1027',
      'P1027',
      'Ananya Sen',
      29,
      'Female',
      58.0,
      'Surgical Ward',
      'S-08',
      'Laparoscopic Appendectomy Post-Op (Day 2)',
      JSON.stringify([]),
      JSON.stringify(['None significant']),
      JSON.stringify({ bp: '118/76 mmHg', hr: '74 bpm', spo2: '99%', temp: '98.8 °F' }),
      `${todayStr}T11:00:00.000Z`,
      'SMARTMED:PATIENT:P1027:ANANYA_SEN:S08'
    ],
    [
      'pat-1028',
      'P1028',
      'Fatima Khan',
      38,
      'Female',
      63.5,
      'General Ward',
      'G-15',
      'Type 2 Diabetes Mellitus / Diabetic Foot Cellulitis',
      JSON.stringify(['Penicillin', 'Cephalosporins']),
      JSON.stringify(['Diabetic Retinopathy', 'Hypothyroidism']),
      JSON.stringify({ bp: '130/84 mmHg', hr: '80 bpm', spo2: '97%', temp: '99.1 °F' }),
      `${todayStr}T14:20:00.000Z`,
      'SMARTMED:PATIENT:P1028:FATIMA_KHAN:G15'
    ],
    [
      'pat-1029',
      'P1029',
      'Robert D\'Souza',
      68,
      'Male',
      76.0,
      'Cardiology',
      'C-09',
      'Non-STEMI Post Angioplasty / Atrial Fibrillation',
      JSON.stringify(['Codeine']),
      JSON.stringify(['CAD', 'Post PCI Stent 2024', 'Chronic Kidney Disease Stage 2']),
      JSON.stringify({ bp: '124/78 mmHg', hr: '68 bpm', spo2: '97%', temp: '98.2 °F' }),
      `${todayStr}T10:00:00.000Z`,
      'SMARTMED:PATIENT:P1029:ROBERT_DSOUZA:C09'
    ],
    [
      'pat-1030',
      'P1030',
      'Aarav Mehta',
      8,
      'Male',
      26.0,
      'Pediatric Ward',
      'P-03',
      'Acute Bronchial Asthma Exacerbation',
      JSON.stringify(['Peanuts', 'Amoxicillin']),
      JSON.stringify(['Atopic Dermatitis']),
      JSON.stringify({ bp: '100/65 mmHg', hr: '98 bpm', spo2: '95%', temp: '98.9 °F' }),
      `${todayStr}T07:45:00.000Z`,
      'SMARTMED:PATIENT:P1030:AARAV_MEHTA:P03'
    ],
    [
      'pat-1031',
      'P1031',
      'Meera Krishnan',
      51,
      'Female',
      70.0,
      'Surgical Ward',
      'S-14',
      'Elective Laparoscopic Cholecystectomy Post-Op',
      JSON.stringify([]),
      JSON.stringify(['Cholelithiasis', 'Obesity Class I']),
      JSON.stringify({ bp: '122/80 mmHg', hr: '72 bpm', spo2: '98%', temp: '98.6 °F' }),
      `${todayStr}T06:30:00.000Z`,
      'SMARTMED:PATIENT:P1031:MEERA_KRISHNAN:S14'
    ],
    [
      'pat-1032',
      'P1032',
      'Harpreet Singh',
      42,
      'Male',
      84.0,
      'General Ward',
      'G-06',
      'Closed Left Femur Fracture / Post ORIF Fixation',
      JSON.stringify(['Tramadol']),
      JSON.stringify(['No prior medical conditions']),
      JSON.stringify({ bp: '126/82 mmHg', hr: '78 bpm', spo2: '99%', temp: '98.4 °F' }),
      `${todayStr}T12:10:00.000Z`,
      'SMARTMED:PATIENT:P1032:HARPREET_SINGH:G06'
    ],
    [
      'pat-1033',
      'P1033',
      'Kavita Joshi',
      33,
      'Female',
      59.0,
      'General Ward',
      'G-07',
      'Acute Infectious Gastroenteritis with Moderate Dehydration',
      JSON.stringify(['Ciprofloxacin']),
      JSON.stringify(['Irritable Bowel Syndrome']),
      JSON.stringify({ bp: '110/70 mmHg', hr: '88 bpm', spo2: '98%', temp: '99.4 °F' }),
      `${todayStr}T15:00:00.000Z`,
      'SMARTMED:PATIENT:P1033:KAVITA_JOSHI:G07'
    ]
  ];

  for (const p of patients) {
    insertPatient.run(...p);
  }

  console.log('Seeding prescriptions and medication schedules...');
  const insertRx = db.prepare(`
    INSERT INTO prescriptions (
      id, patientId, doctorId, doctorName, medicine, dose, route,
      frequency, durationDays, startDate, startTime, instructions, isStat,
      status, stoppedReason, stoppedBy, stoppedAt, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSched = db.prepare(`
    INSERT INTO medication_schedules (
      id, prescriptionId, patientId, medicine, dose, route,
      scheduledTime, status, administeredAt, administeredBy, administeredByRole,
      reason, notes, isStat, riskScore, riskLevel, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const prescriptions = [
    // Rahul Sharma (P1024)
    {
      id: 'rx-1024-01',
      patientId: 'pat-1024',
      doctorId: 'usr-doc-01',
      doctorName: 'Dr. Rajesh Sharma',
      medicine: 'Paracetamol',
      dose: '500 mg',
      route: 'Oral',
      frequency: '3 times/day',
      durationDays: 5,
      startDate: todayStr,
      startTime: '08:00',
      instructions: 'Take after meals for post-operative wound pain. Max 4g in 24 hours.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T08:00:00.000Z`, status: 'GIVEN', administeredAt: `${todayStr}T08:04:22.000Z`, administeredBy: 'Nurse Priya Patel', role: 'NURSE', note: 'Given with water after breakfast. Pain level 4/10.' },
        { time: `${todayStr}T14:00:00.000Z`, status: 'DUE', note: 'Afternoon scheduled dose due now.' },
        { time: `${todayStr}T20:00:00.000Z`, status: 'UPCOMING', note: 'Evening dose' }
      ]
    },
    {
      id: 'rx-1024-02',
      patientId: 'pat-1024',
      doctorId: 'usr-doc-01',
      doctorName: 'Dr. Rajesh Sharma',
      medicine: 'Pantoprazole',
      dose: '40 mg',
      route: 'Oral',
      frequency: 'Once daily',
      durationDays: 7,
      startDate: todayStr,
      startTime: '07:00',
      instructions: 'Administer 30 mins before morning meal for GI mucosal protection.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T07:00:00.000Z`, status: 'GIVEN', administeredAt: `${todayStr}T07:08:15.000Z`, administeredBy: 'Nurse Priya Patel', role: 'NURSE', note: 'Pre-breakfast dose administered.' }
      ]
    },
    {
      id: 'rx-1024-03',
      patientId: 'pat-1024',
      doctorId: 'usr-doc-01',
      doctorName: 'Dr. Rajesh Sharma',
      medicine: 'Ondansetron',
      dose: '4 mg',
      route: 'IV Bolus',
      frequency: 'STAT',
      durationDays: 1,
      startDate: todayStr,
      startTime: '11:30',
      instructions: 'Administer STAT for acute post-operative nausea.',
      isStat: 1,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T11:30:00.000Z`, status: 'DUE', isStat: 1, note: 'Urgent STAT order pending administration.' }
      ]
    },

    // Sunita Devi (P1025)
    {
      id: 'rx-1025-01',
      patientId: 'pat-1025',
      doctorId: 'usr-doc-02',
      doctorName: 'Dr. Neha Verma',
      medicine: 'Furosemide',
      dose: '40 mg',
      route: 'Oral',
      frequency: 'Twice daily',
      durationDays: 10,
      startDate: todayStr,
      startTime: '08:00',
      instructions: 'Diuretic therapy for CHF. Monitor daily weight & fluid balance.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T08:00:00.000Z`, status: 'DELAYED', administeredAt: `${todayStr}T09:45:00.000Z`, administeredBy: 'Nurse Priya Patel', role: 'NURSE', reason: 'Patient at Radiology for Chest X-Ray', note: 'Given once patient returned to cardiology ward.' },
        { time: `${todayStr}T16:00:00.000Z`, status: 'UPCOMING', note: 'Afternoon dose' }
      ]
    },
    {
      id: 'rx-1025-02',
      patientId: 'pat-1025',
      doctorId: 'usr-doc-02',
      doctorName: 'Dr. Neha Verma',
      medicine: 'Atorvastatin',
      dose: '20 mg',
      route: 'Oral',
      frequency: 'Once daily',
      durationDays: 30,
      startDate: todayStr,
      startTime: '21:00',
      instructions: 'Bedtime lipid-lowering therapy.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T21:00:00.000Z`, status: 'UPCOMING', note: 'Bedtime dose' }
      ]
    },

    // Vikram Malhotra (P1026 - ICU)
    {
      id: 'rx-1026-01',
      patientId: 'pat-1026',
      doctorId: 'usr-doc-01',
      doctorName: 'Dr. Rajesh Sharma',
      medicine: 'Ceftriaxone',
      dose: '1 g',
      route: 'IV Infusion',
      frequency: 'Twice daily',
      durationDays: 7,
      startDate: todayStr,
      startTime: '08:00',
      instructions: 'Infuse over 30 mins in 100ml NS for severe sepsis.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T08:00:00.000Z`, status: 'GIVEN', administeredAt: `${todayStr}T08:12:00.000Z`, administeredBy: 'Nurse Anjali Gupta', role: 'NURSE', note: 'IV infusion completed smoothly. No adverse reactions.' },
        { time: `${todayStr}T20:00:00.000Z`, status: 'UPCOMING', note: 'Night infusion' }
      ]
    },
    {
      id: 'rx-1026-02',
      patientId: 'pat-1026',
      doctorId: 'usr-doc-01',
      doctorName: 'Dr. Rajesh Sharma',
      medicine: 'Hydrocortisone',
      dose: '100 mg',
      route: 'IV Bolus',
      frequency: 'STAT',
      durationDays: 1,
      startDate: todayStr,
      startTime: '10:45',
      instructions: 'STAT dose for septic hypotension support.',
      isStat: 1,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T10:45:00.000Z`, status: 'GIVEN', administeredAt: `${todayStr}T10:48:30.000Z`, administeredBy: 'Nurse Anjali Gupta', role: 'NURSE', isStat: 1, note: 'STAT push administered in ICU-02. Mean arterial pressure stabilized.' }
      ]
    },

    // Ananya Sen (P1027)
    {
      id: 'rx-1027-01',
      patientId: 'pat-1027',
      doctorId: 'usr-doc-01',
      doctorName: 'Dr. Rajesh Sharma',
      medicine: 'Tramadol',
      dose: '50 mg',
      route: 'Oral',
      frequency: '3 times/day',
      durationDays: 3,
      startDate: todayStr,
      startTime: '06:00',
      instructions: 'For moderate surgical breakthrough incision pain.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T06:00:00.000Z`, status: 'OVERDUE', note: 'Scheduled early morning dose was not administered in shift handover.' },
        { time: `${todayStr}T14:00:00.000Z`, status: 'DUE', note: 'Afternoon scheduled dose' },
        { time: `${todayStr}T22:00:00.000Z`, status: 'UPCOMING', note: 'Night dose' }
      ]
    },

    // Robert D'Souza (P1029)
    {
      id: 'rx-1029-01',
      patientId: 'pat-1029',
      doctorId: 'usr-doc-02',
      doctorName: 'Dr. Neha Verma',
      medicine: 'Metoprolol Succinate',
      dose: '50 mg',
      route: 'Oral',
      frequency: 'Once daily',
      durationDays: 30,
      startDate: todayStr,
      startTime: '08:00',
      instructions: 'Check apical pulse before giving. Hold if pulse < 55 bpm.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T08:00:00.000Z`, status: 'HELD', administeredAt: `${todayStr}T08:10:00.000Z`, administeredBy: 'Nurse Priya Patel', role: 'NURSE', reason: 'Clinical Reason (Bradycardia, HR = 48 bpm)', note: 'Physician Dr. Verma informed. Dose held per protocol.' }
      ]
    },

    // Aarav Mehta (P1030 - Pediatric)
    {
      id: 'rx-1030-01',
      patientId: 'pat-1030',
      doctorId: 'usr-doc-01',
      doctorName: 'Dr. Rajesh Sharma',
      medicine: 'Salbutamol Nebulizer',
      dose: '2.5 mg / 2.5 ml',
      route: 'Inhalation',
      frequency: '4 times/day',
      durationDays: 3,
      startDate: todayStr,
      startTime: '06:00',
      instructions: 'Deliver with oxygen at 6L/min for bronchospasm.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T06:00:00.000Z`, status: 'GIVEN', administeredAt: `${todayStr}T06:05:00.000Z`, administeredBy: 'Nurse Anjali Gupta', role: 'NURSE', note: 'Nebulization completed. Child breathing comfortably.' },
        { time: `${todayStr}T12:00:00.000Z`, status: 'DUE', note: 'Midday nebulization dose due' },
        { time: `${todayStr}T18:00:00.000Z`, status: 'UPCOMING', note: 'Evening dose' },
        { time: `${todayStr}T23:00:00.000Z`, status: 'UPCOMING', note: 'Night dose' }
      ]
    },

    // Meera Krishnan (P1031)
    {
      id: 'rx-1031-01',
      patientId: 'pat-1031',
      doctorId: 'usr-doc-01',
      doctorName: 'Dr. Rajesh Sharma',
      medicine: 'Enoxaparin',
      dose: '40 mg / 0.4 ml',
      route: 'Subcutaneous',
      frequency: 'Once daily',
      durationDays: 5,
      startDate: todayStr,
      startTime: '18:00',
      instructions: 'DVT prophylaxis. Inject deep subcutaneous in abdominal wall.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T18:00:00.000Z`, status: 'UPCOMING', note: 'Evening subcutaneous injection' }
      ]
    },

    // Harpreet Singh (P1032)
    {
      id: 'rx-1032-01',
      patientId: 'pat-1032',
      doctorId: 'usr-doc-01',
      doctorName: 'Dr. Rajesh Sharma',
      medicine: 'Acetaminophen / Codeine',
      dose: '500 mg / 30 mg',
      route: 'Oral',
      frequency: 'Twice daily',
      durationDays: 4,
      startDate: todayStr,
      startTime: '08:00',
      instructions: 'Post-ORIF orthopedic pain control.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T08:00:00.000Z`, status: 'REFUSED', administeredAt: `${todayStr}T08:25:00.000Z`, administeredBy: 'Nurse Priya Patel', role: 'NURSE', reason: 'Patient Refused (Feeling nauseous, asked to take later)', note: 'Patient requested delay until nausea subsides.' },
        { time: `${todayStr}T20:00:00.000Z`, status: 'UPCOMING', note: 'Night dose' }
      ]
    },

    // Kavita Joshi (P1033)
    {
      id: 'rx-1033-01',
      patientId: 'pat-1033',
      doctorId: 'usr-doc-01',
      doctorName: 'Dr. Rajesh Sharma',
      medicine: 'ORS Solution + Zinc',
      dose: '200 ml',
      route: 'Oral',
      frequency: '4 times/day',
      durationDays: 2,
      startDate: todayStr,
      startTime: '08:00',
      instructions: 'Oral hydration for gastroenteritis.',
      isStat: 0,
      status: 'ACTIVE',
      schedules: [
        { time: `${todayStr}T08:00:00.000Z`, status: 'GIVEN', administeredAt: `${todayStr}T08:15:00.000Z`, administeredBy: 'Nurse Priya Patel', role: 'NURSE', note: 'Tolerated oral fluids well.' },
        { time: `${todayStr}T12:00:00.000Z`, status: 'DUE', note: 'Midday hydration' },
        { time: `${todayStr}T16:00:00.000Z`, status: 'UPCOMING', note: 'Afternoon hydration' },
        { time: `${todayStr}T20:00:00.000Z`, status: 'UPCOMING', note: 'Night hydration' }
      ]
    }
  ];

  let schedCount = 1;
  for (const rx of prescriptions) {
    insertRx.run(
      rx.id,
      rx.patientId,
      rx.doctorId,
      rx.doctorName,
      rx.medicine,
      rx.dose,
      rx.route,
      rx.frequency,
      rx.durationDays,
      rx.startDate,
      rx.startTime,
      rx.instructions,
      rx.isStat,
      rx.status,
      null,
      null,
      null,
      `${todayStr}T07:00:00.000Z`,
      `${todayStr}T07:00:00.000Z`
    );

    for (const s of rx.schedules) {
      const schedId = `sch-${schedCount.toString().padStart(4, '0')}`;
      const isStatFlag = s.isStat || rx.isStat || 0;
      const riskScore = isStatFlag ? 75 : (s.status === 'OVERDUE' ? 70 : 20);
      const riskLevel = riskScore >= 60 ? 'HIGH' : riskScore >= 35 ? 'MODERATE' : 'LOW';

      insertSched.run(
        schedId,
        rx.id,
        rx.patientId,
        rx.medicine,
        rx.dose,
        rx.route,
        s.time,
        s.status,
        s.administeredAt || null,
        s.administeredBy || null,
        s.role || null,
        s.reason || null,
        s.note || null,
        isStatFlag,
        riskScore,
        riskLevel,
        `${todayStr}T07:00:00.000Z`
      );
      schedCount++;
    }
  }

  console.log('Seeding pharmacy stock...');
  const insertStock = db.prepare(`
    INSERT INTO pharmacy_stock (id, medicine, category, stockQty, unit, reorderLevel, location, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stockItems = [
    ['stk-01', 'Paracetamol 500mg Tab', 'Analgesics', 1450, 'Tablets', 300, 'Shelf A-12', 'IN_STOCK'],
    ['stk-02', 'Pantoprazole 40mg Tab', 'Gastrointestinal', 820, 'Tablets', 200, 'Shelf B-04', 'IN_STOCK'],
    ['stk-03', 'Ondansetron 4mg/2ml Inj', 'Antiemetics', 340, 'Ampoules', 100, 'Emergency Rack E-01', 'IN_STOCK'],
    ['stk-04', 'Furosemide 40mg Tab', 'Cardiovascular', 560, 'Tablets', 150, 'Shelf C-08', 'IN_STOCK'],
    ['stk-05', 'Atorvastatin 20mg Tab', 'Cardiovascular', 900, 'Tablets', 200, 'Shelf C-14', 'IN_STOCK'],
    ['stk-06', 'Ceftriaxone 1g Inj', 'Antibiotics', 210, 'Vials', 80, 'Cold Storage CS-02', 'IN_STOCK'],
    ['stk-07', 'Hydrocortisone 100mg Inj', 'Emergency / STAT', 95, 'Vials', 50, 'Emergency Crash Cart', 'IN_STOCK'],
    ['stk-08', 'Amoxicillin + Clavulanic 625mg', 'Antibiotics', 600, 'Tablets', 150, 'Shelf D-03', 'IN_STOCK'],
    ['stk-09', 'Tramadol 50mg Cap', 'Controlled Analgesics', 85, 'Capsules', 100, 'Safe Locker L-02', 'LOW_STOCK'],
    ['stk-10', 'Insulin Glargine 100 IU/ml', 'Endocrine', 45, 'Pens', 20, 'Refrigerator R-01', 'IN_STOCK'],
    ['stk-11', 'Metoprolol Succinate 50mg', 'Cardiovascular', 410, 'Tablets', 100, 'Shelf C-02', 'IN_STOCK'],
    ['stk-12', 'Salbutamol Respules 2.5mg', 'Respiratory', 320, 'Respules', 100, 'Shelf E-05', 'IN_STOCK'],
    ['stk-13', 'Enoxaparin 40mg PFS', 'Hematology', 110, 'Syringes', 50, 'Cold Storage CS-01', 'IN_STOCK'],
    ['stk-14', 'Adrenaline (Epinephrine) 1:1000', 'Emergency / STAT', 65, 'Ampoules', 40, 'Emergency Crash Cart', 'IN_STOCK']
  ];

  for (const s of stockItems) {
    insertStock.run(...s);
  }

  console.log('Seeding initial audit logs...');
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, timestamp, userId, userName, userRole, action, patientId, patientName, medicineName, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const auditEvents = [
    [
      'aud-001',
      `${todayStr}T07:05:00.000Z`,
      'usr-doc-01',
      'Dr. Rajesh Sharma',
      'DOCTOR',
      'PRESCRIPTION_CREATED',
      'pat-1024',
      'Rahul Sharma',
      'Paracetamol 500 mg',
      JSON.stringify({ medicine: 'Paracetamol', dose: '500 mg', frequency: '3 times/day', duration: '5 days', route: 'Oral', eventsGenerated: 15 })
    ],
    [
      'aud-002',
      `${todayStr}T07:08:00.000Z`,
      'usr-doc-01',
      'Dr. Rajesh Sharma',
      'DOCTOR',
      'PRESCRIPTION_CREATED',
      'pat-1024',
      'Rahul Sharma',
      'Pantoprazole 40 mg',
      JSON.stringify({ medicine: 'Pantoprazole', dose: '40 mg', frequency: 'Once daily', duration: '7 days', route: 'Oral' })
    ],
    [
      'aud-003',
      `${todayStr}T07:08:15.000Z`,
      'usr-nur-01',
      'Nurse Priya Patel',
      'NURSE',
      'MEDICATION_GIVEN',
      'pat-1024',
      'Rahul Sharma',
      'Pantoprazole 40 mg',
      JSON.stringify({ scheduled: '07:00', administeredAt: '07:08:15', qrVerified: true, status: 'GIVEN' })
    ],
    [
      'aud-004',
      `${todayStr}T08:04:22.000Z`,
      'usr-nur-01',
      'Nurse Priya Patel',
      'NURSE',
      'MEDICATION_GIVEN',
      'pat-1024',
      'Rahul Sharma',
      'Paracetamol 500 mg',
      JSON.stringify({ scheduled: '08:00', administeredAt: '08:04:22', qrVerified: true, status: 'GIVEN' })
    ],
    [
      'aud-005',
      `${todayStr}T08:10:00.000Z`,
      'usr-nur-01',
      'Nurse Priya Patel',
      'NURSE',
      'MEDICATION_HELD',
      'pat-1029',
      'Robert D\'Souza',
      'Metoprolol Succinate 50 mg',
      JSON.stringify({ reason: 'Bradycardia (HR = 48 bpm)', doctorNotified: true, status: 'HELD' })
    ],
    [
      'aud-006',
      `${todayStr}T09:45:00.000Z`,
      'usr-nur-01',
      'Nurse Priya Patel',
      'NURSE',
      'MEDICATION_DELAYED_ADMINISTERED',
      'pat-1025',
      'Sunita Devi',
      'Furosemide 40 mg',
      JSON.stringify({ scheduled: '08:00', administeredAt: '09:45:00', reason: 'Patient at Radiology for Chest X-Ray' })
    ],
    [
      'aud-007',
      `${todayStr}T10:48:30.000Z`,
      'usr-nur-02',
      'Nurse Anjali Gupta',
      'NURSE',
      'STAT_MEDICATION_GIVEN',
      'pat-1026',
      'Vikram Malhotra',
      'Hydrocortisone 100 mg',
      JSON.stringify({ isStat: true, qrVerified: true, ward: 'ICU', bed: 'ICU-02' })
    ]
  ];

  for (const a of auditEvents) {
    insertAudit.run(...a);
  }

  console.log('SmartMedChart demo database seeded successfully!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
