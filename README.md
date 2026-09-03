# Med Sathi (मेड-साथी)
### Next-Generation Closed-Loop Clinical eMAR & Bedside Medication Safety System

> **Eliminating the #1 preventable cause of inpatient hospital morbidity: Medication Administration Errors.**  
> Built for NABH & JCI compliance with bedside 5-Rights QR verification, clinical AI dictation, and emergency resuscitation protocols.

---

## 🌟 Core Features & Innovations

### 1. 🛡️ Closed-Loop 5-Rights Bedside Verification
* **Right Patient, Right Drug, Right Dose, Right Route, Right Time.**
* Bedside QR barcode scanning cross-matches the physical wristband against the electronic prescription before unlocking dose administration.
* Real-time allergy interception (e.g., Penicillin cross-reactivity with Amoxicillin).

### 2. 🎙️ Clinical AI Voice-to-Prescription (Doctor Dictation)
* Natural speech recognition extracts Drug, Dose, Route, Frequency, Duration, and STAT priority.
* Converts unstructured voice into structured e-prescriptions with live auto-generated schedule previews.

### 3. 🚨 "CODE BLUE" Emergency Resuscitation Console
* High-contrast ICU console triggered during cardiac arrest / acute emergencies.
* **2-Minute Epinephrine Cycle Timer:** Audio-visual countdown for CPR cycles.
* **Weight-Adjusted ACLS Emergency Push:** Dynamically calculates emergency doses (Adrenaline, Amiodarone, Atropine, Bicarbonate) based on patient weight.
* **Defibrillation Shock Controller:** Tracks biphasic joules (120J, 150J, 200J) and synchronizes events directly into the immutable audit trail.

### 4. 💬 Med-Sathi Clinical AI Copilot (Chatbot)
* Floating assistant widget answering clinical pharmacology questions, hospital protocols, and live ward census queries (*"How many patients in ICU?"*).
* Includes quick 1-click prompt chips for rapid demonstration during live pitches.

### 5. 🔬 Drug-Drug Interaction (DDI) Safety Matrix
* Interactive polypharmacy cross-grid mapping potential drug-drug interactions (High Risk, Moderate, Safe) with clinical rationale.

### 6. 📱 Patient & Family Care Companion
* Layman-friendly bedside care tracker accessible via bedside QR code or web portal.
* Plain-language drug explanations (e.g., Pantoprazole -> "Stomach Acidity & Gastric Protection").
* Multilingual toggle between English and Hindi (**हिंदी**).

---

## 👥 4-Role Persona Hub (1-Click Switcher)

Med Sathi features an instant persona switcher located in the top navigation bar for seamless judge demos:

| Role | Persona | Clinical Responsibility |
| :--- | :--- | :--- |
| **DOCTOR** | Dr. Sharma (Internal Medicine) | Prescribes medications via AI Voice, reviews patient profiles, checks DDI Matrix |
| **NURSE** | Nurse Priya (Ward RN) | Conducts shift rounds, scans bedside QR barcodes, executes 5-Rights administration |
| **ADMIN / CMO** | Dr. Gupta (Clinical Governance) | Monitors hospital-wide compliance, delayed doses, and blockchain audit logs |
| **PHARMACIST** | Anil Verma (Central Pharmacy) | Dispensing queue, stock levels, and controlled substance verification |

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js**: v18 or later
* **npm**: v9 or later

### Running Locally
```bash
# 1. Install all dependencies (root, server, client)
npm run install:all

# 2. Launch both Backend API (Port 5000) and Frontend (Port 3000) concurrently
npm run dev
```

Open your browser at:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Technology Stack

* **Frontend:** React 18, Tailwind CSS, Lucide Icons, Recharts, HTML5-QRCode, QRCode.react, Vite
* **Backend:** Node.js, Express, Better-SQLite3 (WAL mode for zero-latency bedside transactions)
* **Architecture:** Closed-Loop Medication Administration (eMAR) with immutable SHA-256 clinical audit logging