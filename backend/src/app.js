const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middlewares/errorHandler');
const PaymentController = require('./controllers/paymentController');

const app = express();

// Log para depuração
app.use((req, res, next) => {
    console.log(`[DEBUG] Request: ${req.method} ${req.url}`);
    next();
});

// Middlewares
app.use(helmet());
app.use(cors());

// Stripe Webhook
app.post('/payment/webhook', express.raw({ type: 'application/json' }), PaymentController.webhook);

// JSON Parsing
app.use(express.json());

// APIs
app.use('/auth', authRoutes);
app.use('/payment', paymentRoutes);

// Test route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.use(errorHandler);

module.exports = app;
