// api/create-payment-intent.js
// Vercel Serverless Function — Stripe PaymentIntent 생성
// 
// 배포 방법:
// 1. 프로젝트 루트에 api/ 폴더 생성
// 2. 이 파일을 api/create-payment-intent.js 로 저장
// 3. Vercel Dashboard → Settings → Environment Variables 에서 추가:
//    STRIPE_SECRET_KEY = sk_test_51TCQZgERxQ0bHKfy...

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, customerEmail, customerName, metadata } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Invalid amount (minimum $0.50)' });
    }

    // PaymentIntent 생성
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // cents 단위
      currency: currency || 'usd',
      receipt_email: customerEmail || undefined,
      description: 'TRE Supply Co. Order',
      metadata: {
        customer_name: customerName || '',
        customer_email: customerEmail || '',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
};
