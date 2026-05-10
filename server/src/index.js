require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const setupSocket = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Trust proxy for Render load balancers
app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/family', require('./routes/family'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Setup Socket
setupSocket(io);

// Make io accessible
app.set('io', io);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\n🚀 HomeExpense Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}

start().catch(console.error);
