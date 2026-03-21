const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const leadRoutes = require('./routes/leadRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const { isFirebaseAdminConfigured, firebaseAdminError } = require('./config/firebaseAdmin');
const { isMongoConnected } = require('./config/mongodb');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalhostOrigin = (origin = '') => /^https?:\/\/localhost:\d+$/i.test(origin);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isLocalhostOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS policy does not allow this origin'));
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongoConnected: isMongoConnected(),
    firebaseAdminConfigured: isFirebaseAdminConfigured,
    firebaseAdminError: firebaseAdminError ? firebaseAdminError.message : null,
  });
});

app.use('/api/leads', leadRoutes);

app.use(errorHandler);

module.exports = app;
