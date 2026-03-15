const express = require('express');
const PaymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Checkout Session (Protegido)
router.post('/create-checkout-session', authMiddleware, PaymentController.createCheckoutSession);

module.exports = router;
