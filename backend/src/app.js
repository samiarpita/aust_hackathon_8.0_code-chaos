const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const questionRoutes = require('./routes/questionRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ------------------------------------------------------------------------------
// CORS Configuration
// ------------------------------------------------------------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ------------------------------------------------------------------------------
// Body Parsers & Request Logging
// ------------------------------------------------------------------------------
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ------------------------------------------------------------------------------
// Health Check Routes
// ------------------------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'student-misconception-radar-backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'student-misconception-radar-backend',
    timestamp: new Date().toISOString()
  });
});

// ------------------------------------------------------------------------------
// API Routes
// ------------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/analyze', analysisRoutes); // Alias for compatibility with PDF guide

// ------------------------------------------------------------------------------
// 404 Handler for Unknown Endpoints
// ------------------------------------------------------------------------------
app.use((req, res, next) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// ------------------------------------------------------------------------------
// Central Error Handler
// ------------------------------------------------------------------------------
app.use(errorHandler);

module.exports = app;
