const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const instructorRoutes = require('./routes/instructors');
const mentorRoutes = require('./routes/mentors');
const operationRoutes = require('./routes/operations');
const supervisorRoutes = require('./routes/supervisor');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/supervisor', supervisorRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'MEC Academy LMS',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Fallback SPA routing for Express 5
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) return next();

  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) {
      res.status(200).send(`
        <h1>MEC Academy LMS Backend Running</h1>
        <p>API is active on port ${PORT}. Run <code>npm run dev</code> in client folder or build client with <code>npm run build</code>.</p>
      `);
    }
  });
});

if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  MEC ACADEMY LEARNING MANAGEMENT SYSTEM`);
    console.log(`  Backend API listening on http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

module.exports = app;
