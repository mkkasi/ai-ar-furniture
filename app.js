const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const furnitureRoutes = require('./routes/furnitureRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const savedDesignRoutes = require('./routes/savedDesignRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

/*
|--------------------------------------------------------------------------
| CORS CONFIGURATION
|--------------------------------------------------------------------------
| Allows:
| - Flutter Web development server
| - React/Vite admin dashboard
| - localhost / 127.0.0.1
| - Configured production frontend
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  // React/Vite Admin
  'http://localhost:5173',
  'http://127.0.0.1:5173',

  // Flutter Web
  'http://localhost:52997',
  'http://127.0.0.1:52997',

  // Other local development ports
  'http://localhost:3000',
  'http://127.0.0.1:3000',

  // Environment configured frontend URLs
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean)
    : []),
];

const corsOptions = {
  origin: function (origin, callback) {
    /*
     * Requests such as Postman/server-to-server may not have
     * an Origin header. Allow them.
     */
    if (!origin) {
      return callback(null, true);
    }

    /*
     * Allow explicitly configured origins.
     */
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    /*
     * DEVELOPMENT:
     * Allow localhost and 127.0.0.1 on any port.
     */
    if (
      process.env.NODE_ENV !== 'production' &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }

    console.log(`[CORS] Blocked origin: ${origin}`);

    return callback(
      new Error(`CORS blocked for origin: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ],

  exposedHeaders: [
    'Content-Length',
    'Content-Type',
  ],

  optionsSuccessStatus: 204,
};

// Apply CORS before routes
app.use(cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Security & Core Middleware
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(express.json({ limit: '2mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '2mb',
  })
);

app.use(mongoSanitize());
app.use(xss());

/*
|--------------------------------------------------------------------------
| Logging
|--------------------------------------------------------------------------
*/

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan(
      process.env.NODE_ENV === 'production'
        ? 'combined'
        : 'dev'
    )
  );
}

/*
|--------------------------------------------------------------------------
| Global Rate Limiter
|--------------------------------------------------------------------------
*/

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/*
|--------------------------------------------------------------------------
| Root Route
|--------------------------------------------------------------------------
*/

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AR Furniture Studio API is running',
    status: 'ok',
  });
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AR Furniture Studio API is running',
    status: 'ok',
    timestamp: new Date(),
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes);

app.use('/api/furniture', furnitureRoutes);

app.use('/api/categories', categoryRoutes);

app.use('/api/favorites', favoriteRoutes);

app.use('/api/reviews', reviewRoutes);

app.use('/api/saved-designs', savedDesignRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/ai', aiRoutes);

/*
|--------------------------------------------------------------------------
| 404 + Error Handling
|--------------------------------------------------------------------------
| These MUST remain last.
|--------------------------------------------------------------------------
*/

app.use(notFound);

app.use(errorHandler);

module.exports = app;
