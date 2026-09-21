require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
      console.log(
        `[Server] AR Furniture Studio API running in ${
          process.env.NODE_ENV || 'development'
        } mode`
      );

      console.log(`[Server] Listening on http://${HOST}:${PORT}`);
      console.log(`[Server] Local: http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`[Server] ${signal} received. Shutting down gracefully...`);

      server.close(() => {
        console.log('[Server] Closed remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      console.error('[Server] Unhandled Rejection:', err);

      server.close(() => {
        process.exit(1);
      });
    });

    process.on('uncaughtException', (err) => {
      console.error('[Server] Uncaught Exception:', err);

      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
};

startServer();