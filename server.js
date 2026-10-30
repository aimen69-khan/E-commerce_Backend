
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// ==========================================
// 1. CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  'https://react-e-commerce-three-ruby.vercel.app',
  'https://dashboard-01-smoky.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  ...(process.env.CLIENT_URL || '').split(','),
  ...(process.env.CORS_ORIGINS || '').split(',')
]
  .map(origin => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header (Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error('CORS blocked origin:', origin);

    return callback(new Error('CORS: Origin not allowed'));
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],

  optionsSuccessStatus: 204
};

// CORS MUST run before all API routes and middleware
app.use(cors(corsOptions));

// Handle browser preflight requests
app.options('*', cors(corsOptions));

// ==========================================
// 2. BODY PARSERS
// ==========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. STATIC FILES
// ==========================================

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// ==========================================
// 4. DATABASE CONNECTION
// ==========================================

connectDB();

// ==========================================
// 5. API ROUTES
// ==========================================

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ==========================================
// 6. HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    cors: 'enabled'
  });
});

// ==========================================
// 7. ROOT ROUTE
// ==========================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is working'
  });
});

// ==========================================
// 8. 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ==========================================
// 9. ERROR HANDLER
// ==========================================

app.use(errorHandler);

module.exports = app;
