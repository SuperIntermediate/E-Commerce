# Payment Gateway Integration

This project supports integrating PayPal (Sandbox), Razorpay (Test), Stripe Checkout, plus Google Pay (demo via Stripe) and Paytm (server-assisted).

## Configuration
Update `src/app/config/payment.config.ts` with your sandbox/test keys:

- `paypalClientId`: PayPal Sandbox REST App Client ID
- `paypalCurrency`: Currency code used for PayPal (e.g., `USD`)
- `razorpayKeyId`: Razorpay Test Key ID (e.g., `rzp_test_xxxxxxxx`)
- `razorpayCurrency`: Razorpay currency (e.g., `INR`)
- `stripePublishableKey`: Stripe publishable key (required if using client-side `redirectToCheckout` without a `url`)
- `stripePaymentLinkUrl`: Optional. Direct Payment Link as a no-backend fallback
- `backendBaseUrl`: Optional. Base URL of your backend for server-assisted flows
- `paytmMid`: Paytm Merchant ID
- `paytmEnvironment`: `'STAGE'` or `'PROD'`
- `paytmCallbackUrl`: Optional callback URL (use server-provided `callbackUrl` if available)
- `gpayEnvironment`: `'TEST'` or `'PRODUCTION'`
- `gpayMerchantId`: Optional; used for production Google Pay integration

## Backend Endpoints (Optional but Recommended)
If `backendBaseUrl` is provided, the app will call these endpoints:

- `POST /payments/stripe/create-checkout-session`
  - Request: `{ amount: number, currency: string, metadata?: object }`
  - Response: `{ url?: string, sessionId?: string }`
  - Preferred: return a `url` to Stripe Checkout; alternatively return `sessionId` to use client-side `redirectToCheckout`.

- `POST /payments/razorpay/create-order`
  - Request: `{ amount: number, currency: string }` (amount in smallest unit as expected by Razorpay server)
  - Response: `{ id: string }` (Razorpay order ID)
  - The app passes this `order_id` to the Razorpay Checkout options if available.

- `POST /payments/paytm/initiate-transaction`
  - Request: `{ amount: number, customerId: string }`
  - Response: `{ orderId: string, txnToken: string, amount: string|number, callbackUrl?: string }`
  - The frontend loads Paytm CheckoutJS with `mid` and the returned `txnToken`, then invokes the widget.

Ensure CORS allows calls from the dev origin.

## Checkout UI Flow
On the checkout page:
- Select a payment method (PayPal, Razorpay, UPI, Paytm, Google Pay, Stripe)
- Ensure the shipping address is valid; payment actions remain disabled otherwise.

### PayPal (Sandbox)
- Click "Initialize PayPal" to load PayPal buttons.
- Use a Sandbox buyer account to approve the payment.
- On successful approval and capture, the order is placed locally and you’re redirected to Orders.

### Razorpay (Test)
- Click "Pay with Razorpay" to open the Razorpay Checkout.
- Provide test payment details (Razorpay provides test cards and UPI strings).
- On successful handler callback, the order is placed locally.
- If `backendBaseUrl` is set, a server-side Razorpay Order is created and attached to the checkout options.

### UPI (via Razorpay)
- Select UPI, enter your UPI VPA (e.g., `name@bank`), then click "Pay via UPI".
- Uses Razorpay Checkout in UPI mode. If `backendBaseUrl` is set, a Razorpay Order ID is attached.

### Paytm (Server-Assisted)
- Select Paytm and click "Pay with Paytm".
- Requires `paytmMid` and `backendBaseUrl`; the app calls your backend to get `txnToken` and `orderId`, then loads the Paytm widget.
- On transaction status callback, the order is placed locally.

### Google Pay (Demo via Stripe)
- Select Google Pay and click "Pay with Google Pay".
- This demo routes to Stripe Checkout for easy testing. For production, integrate Google Pay API for Web with gateway tokenization and server-side charge.

### Stripe
- Click "Pay with Stripe" to redirect to Stripe Checkout.
- If `backendBaseUrl` is configured, the app calls your server to create the session; otherwise, it uses `stripePaymentLinkUrl` if provided.
- Production: handle order creation server-side (webhook or success URL) after successful payment.

## Testing Notes
- PayPal: Create a Sandbox REST App to get a Client ID, and use Sandbox buyer credentials.
- Razorpay: Use Test Key ID and Razorpay’s test payment details.
- UPI: Use Razorpay’s provided UPI test handles or your own in test mode.
- Paytm: Use Paytm STAGE environment with your MID and backend to obtain `txnToken`.
- Google Pay: In demo, ensure Stripe test keys are configured.
- Stripe: Prefer server-side sessions; for simple testing, a Payment Link is acceptable.

## Currency
The app sets the Angular `DEFAULT_CURRENCY_CODE` to `INR` in `app.config.ts`.
- PayPal currency is set separately via `paypalCurrency`.
- Stripe and Razorpay use the currencies provided in the config and/or endpoint requests.
- Paytm transactions use amount and currency as configured on your backend and MID.

## Troubleshooting
- If PayPal buttons don’t render: ensure `paypalClientId` is set and network calls aren’t blocked.
- Razorpay opens but fails: confirm `razorpayKeyId` and check console for order creation errors.
- UPI: Ensure VPA format is correct; backend Razorpay order creation failures are non-fatal.
- Paytm: Verify `paytmMid`, backend endpoint response (`txnToken`, `orderId`), and SDK load URL for STAGE/PROD.
- Google Pay: Demo relies on Stripe; make sure Stripe keys and backend are configured.
- Stripe redirect errors: verify your backend returns a `url` or `sessionId`, or set `stripePaymentLinkUrl` as fallback.