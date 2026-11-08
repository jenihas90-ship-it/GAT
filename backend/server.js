require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const candidateRoutes = require('./routes/candidateRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Database Connection
connectDB();

// CORS Configuration - Permissive for Vercel deployment with OPTIONS preflight handling
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.options('*', cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Galo Travel Agency Recruitment API'
  });
});

// Mount Routes (handles both with and without /api prefix for Vercel serverless)
app.use('/api/candidates', candidateRoutes);
app.use('/candidates', candidateRoutes);

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Serve static frontend when deployed unified (single-port / production mode)
const rootDist = path.join(__dirname, '../dist');
const frontendDist = path.join(__dirname, '../frontend/dist');
const targetDist = fs.existsSync(rootDist) ? rootDist : frontendDist;

if (fs.existsSync(targetDist)) {
  app.use(express.static(targetDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/candidates') || req.path.startsWith('/auth')) return next();
    res.sendFile(path.join(targetDist, 'index.html'));
  });
}

// Multer and general Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Passport file is too large. Maximum allowed size is 5MB.'
    });
  }

  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal error occurred.'
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Galo Recruitment Portal API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
