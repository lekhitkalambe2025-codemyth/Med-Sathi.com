const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'smartmedchart.sqlite');
const db = new Database(dbPath);

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize Tables
function initSchema(forceReset = false) {
  if (forceReset) {
    db.exec(`
      DROP TABLE IF EXISTS audit_logs;
      DROP TABLE IF EXISTS medication_schedules;
      DROP TABLE IF EXISTS prescriptions;
      DROP TABLE IF EXISTS pharmacy_stock;
      DROP TABLE IF EXISTS patients;
      DROP TABLE IF EXISTS users;
    `);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL, -- DOCTOR, NURSE, ADMIN, PHARMACIST
      title TEXT,
      department TEXT,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      uhid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      weight REAL NOT NULL,
      ward TEXT NOT NULL, -- General Ward, ICU, Surgical Ward, Pediatric Ward, Cardiology
      bed TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      allergies TEXT, -- JSON array of strings
      medicalHistory TEXT, -- JSON array
      vitals TEXT, -- JSON object { bp, hr, spo2, temp }
      admittedAt TEXT NOT NULL,
      qrCode TEXT NOT NULL,
      arrivalPhase TEXT DEFAULT 'Phase 1'
    );
  `);

  // Non-destructive column addition if table already exists
  try {
    db.exec("ALTER TABLE patients ADD COLUMN arrivalPhase TEXT DEFAULT 'Phase 1';");
  } catch (e) {
    // Column already exists
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      doctorId TEXT NOT NULL,
      doctorName TEXT NOT NULL,
      medicine TEXT NOT NULL,
      dose TEXT NOT NULL,
      route TEXT NOT NULL, -- Oral, IV, IM, SC, Topical, Inhalation
      frequency TEXT NOT NULL, -- STAT, OD, BD, TDS, QID, PRN, Q4H, Q6H, Q8H
      durationDays INTEGER NOT NULL DEFAULT 1,
      startDate TEXT NOT NULL,
      startTime TEXT NOT NULL,
      instructions TEXT,
      isStat INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, MODIFIED, STOPPED
      stoppedReason TEXT,
      stoppedBy TEXT,
      stoppedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS medication_schedules (
      id TEXT PRIMARY KEY,
      prescriptionId TEXT NOT NULL,
      patientId TEXT NOT NULL,
      medicine TEXT NOT NULL,
      dose TEXT NOT NULL,
      route TEXT NOT NULL,
      scheduledTime TEXT NOT NULL, -- ISO timestamp
      status TEXT NOT NULL DEFAULT 'DUE', -- DUE, UPCOMING, OVERDUE, GIVEN, DELAYED, HELD, REFUSED, NOT_GIVEN
      administeredAt TEXT,
      administeredBy TEXT,
      administeredByRole TEXT,
      reason TEXT,
      notes TEXT,
      isStat INTEGER NOT NULL DEFAULT 0,
      riskScore INTEGER DEFAULT 15,
      riskLevel TEXT DEFAULT 'LOW',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (prescriptionId) REFERENCES prescriptions(id),
      FOREIGN KEY (patientId) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      userRole TEXT NOT NULL,
      action TEXT NOT NULL,
      patientId TEXT,
      patientName TEXT,
      medicineName TEXT,
      details TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pharmacy_stock (
      id TEXT PRIMARY KEY,
      medicine TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      stockQty INTEGER NOT NULL,
      unit TEXT NOT NULL,
      reorderLevel INTEGER NOT NULL,
      location TEXT NOT NULL,
      status TEXT DEFAULT 'IN_STOCK'
    );
  `);
}

initSchema();

module.exports = { db, initSchema };
