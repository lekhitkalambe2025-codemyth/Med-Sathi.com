const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { db, initSchema } = require('./db');

const authRoutes = require('./routes/auth');
const patientsRoutes = require('./routes/patients');
const prescriptionsRoutes = require('./routes/prescriptions');
const medicationsRoutes = require('./routes/medications');
const analyticsRoutes = require('./routes/analytics');
const auditRoutes = require('./routes/audit');
const pharmacyRoutes = require('./routes/pharmacy');
const aiRiskRoutes = require('./routes/aiRisk');

const app = express();
const PRIMARY_PORT = process.env.PORT || 5000;
const FALLBACK_PORT = 5050;

// Initialize database schema
initSchema();

// Auto-seed demo dataset if database is freshly created or empty
try {
  const patientCount = db.prepare('SELECT COUNT(*) as c FROM patients').get()?.c || 0;
  if (patientCount === 0) {
    console.log('[SmartMedChart] No patients found in database. Automatically seeding demo dataset...');
    const seedDatabase = require('./seed');
    seedDatabase();
  }
} catch (e) {
  console.warn('[SmartMedChart] Auto-seed check notice:', e.message);
}

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  if (!req.url.startsWith('/assets')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/ai-risk', aiRiskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'SmartMedChart Enterprise API',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files if built
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  } else {
    res.status(404).json({ success: false, error: 'API route not found' });
  }
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`=======================================================`);
    console.log(` SmartMedChart API Server listening on port ${port}`);
    console.log(` Clinical Web App: http://localhost:${port}`);
    console.log(` API Health Check: http://localhost:${port}/api/health`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port !== FALLBACK_PORT) {
      console.warn(`Port ${port} is occupied. Attempting fallback to port ${FALLBACK_PORT}...`);
      startServer(FALLBACK_PORT);
    } else {
      console.error('Server failed to start:', err);
    }
  });
}

startServer(PRIMARY_PORT);
