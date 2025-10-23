export const PaymentConfig = {
  // PayPal Sandbox: create a sandbox app and paste its Client ID below
  paypalClientId: '',
  // For reliable sandbox testing, USD is recommended
  paypalCurrency: 'USD',

  // Razorpay Test Key ID (e.g., 'rzp_test_XXXXXXXX')
  razorpayKeyId: '',
  razorpayCurrency: 'INR',

  // Stripe publishable key (optional if using Payment Links)
  stripePublishableKey: '',
  // Optional Stripe Payment Link URL as a no-backend fallback
  stripePaymentLinkUrl: '',

  // Optional backend base URL for server-assisted flows (Stripe session, Razorpay order, Paytm token)
  backendBaseUrl: 'http://localhost:8080',

  // Paytm configuration (Sandbox/STAGE)
  paytmMid: '', // Merchant ID
  paytmEnvironment: 'STAGE', // 'STAGE' or 'PROD'
  paytmCallbackUrl: '',

  // Google Pay configuration for Web (used via gateway integration)
  googlePayEnvironment: 'TEST', // 'TEST' or 'PRODUCTION'
  googlePayMerchantId: '' // Optional merchant ID (depends on gateway)
};