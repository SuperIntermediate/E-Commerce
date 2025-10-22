import { Injectable } from '@angular/core';
import { PaymentConfig } from '../config/payment.config';

declare const paypal: any;
declare const Razorpay: any;
declare const Stripe: any;

declare global {
  interface Window {
    Paytm?: any;
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private scriptLoaded = new Set<string>();

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded.has(src)) return resolve();
      const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (existing) {
        this.scriptLoaded.add(src);
        return resolve();
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => {
        this.scriptLoaded.add(src);
        resolve();
      };
      s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(s);
    });
  }

  async renderPayPalButtons(containerSelector: string, amount: number, onSuccess: (details: any) => void, onError: (err: any) => void) {
    const params = new URLSearchParams({ 'client-id': PaymentConfig.paypalClientId || '', 'currency': PaymentConfig.paypalCurrency || 'USD' });
    const sdkUrl = `https://www.paypal.com/sdk/js?${params.toString()}`;
    await this.loadScript(sdkUrl);
    if (!paypal || !paypal.Buttons) {
      throw new Error('PayPal SDK not available after load');
    }
    const container = document.querySelector(containerSelector);
    if (!container) throw new Error(`PayPal container not found: ${containerSelector}`);

    return paypal.Buttons({
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: amount.toFixed(2),
                currency_code: PaymentConfig.paypalCurrency || 'USD'
              }
            }
          ]
        });
      },
      onApprove: async (_data: any, actions: any) => {
        try {
          const details = await actions.order.capture();
          onSuccess(details);
        } catch (err) {
          onError(err);
        }
      },
      onError: (err: any) => onError(err)
    }).render(containerSelector);
  }

  async openRazorpayCheckout(amount: number, name: string, description: string, prefill: { name?: string; email?: string; contact?: string }, onSuccess: (resp: any) => void, onError: (err: any) => void, preferredMethod?: 'upi' | 'card', upiVpa?: string) {
    await this.loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!Razorpay) throw new Error('Razorpay SDK not available after load');

    const opts: any = {
      key: PaymentConfig.razorpayKeyId || '',
      amount: Math.max(0, Math.round(amount * 100)), // smallest unit (paise for INR)
      currency: PaymentConfig.razorpayCurrency || 'INR',
      name,
      description,
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || ''
      },
      handler: (resp: any) => {
        try {
          onSuccess(resp);
        } catch (e) {
          onError(e);
        }
      }
    };

    if (preferredMethod === 'upi') {
      opts.method = 'upi';
      if (upiVpa) {
        opts.upi = { vpa: upiVpa };
      }
    }

    // Optional: create an order on backend and attach order_id
    if (PaymentConfig.backendBaseUrl) {
      try {
        const res = await fetch(`${PaymentConfig.backendBaseUrl.replace(/\/$/, '')}/payments/razorpay/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: opts.amount, currency: opts.currency })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            opts.order_id = data.id;
          }
        }
      } catch (e) {
        // Non-fatal; proceed without order_id for basic checkout
        console.warn('Razorpay order creation failed', e);
      }
    }

    try {
      const rzp = new Razorpay(opts);
      rzp.open();
    } catch (err) {
      onError(err);
    }
  }

  async openPaytmCheckout(amount: number, customerId: string, onSuccess: (resp: any) => void, onError: (err: any) => void) {
    if (!PaymentConfig.paytmMid || !PaymentConfig.backendBaseUrl) {
      throw new Error('Paytm requires paytmMid and backendBaseUrl to initiate transaction');
    }

    const envBase = PaymentConfig.paytmEnvironment === 'PROD' ? 'https://securegw.paytm.in' : 'https://securegw-stage.paytm.in';

    try {
      const res = await fetch(`${PaymentConfig.backendBaseUrl.replace(/\/$/, '')}/payments/paytm/initiate-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, customerId })
      });
      if (!res.ok) throw new Error(`Paytm initiate failed: ${res.status}`);
      const data = await res.json(); // expects { orderId, txnToken, amount, callbackUrl }

      await this.loadScript(`${envBase}/merchantpgpui/checkoutjs/merchants/${PaymentConfig.paytmMid}.js`);
      if (!window.Paytm || !window.Paytm.CheckoutJS) throw new Error('Paytm SDK not available after load');

      const config = {
        root: '',
        flow: 'DEFAULT',
        data: {
          orderId: data.orderId,
          token: data.txnToken,
          tokenType: 'TXN_TOKEN',
          amount: Number(data.amount || amount).toFixed(2),
          mid: PaymentConfig.paytmMid,
          callbackUrl: data.callbackUrl || PaymentConfig.paytmCallbackUrl || ''
        },
        handler: {
          transactionStatus: (resp: any) => {
            try {
              onSuccess(resp);
            } catch (e) {
              onError(e);
            }
          },
          notifyMerchant: (eventName: string, data: any) => {
            console.log('Paytm event', eventName, data);
          }
        }
      } as any;

      window.Paytm.CheckoutJS.init(config).then(() => window.Paytm.CheckoutJS.invoke());
    } catch (err) {
      onError(err);
    }
  }

  async redirectStripeCheckout(amount: number, currency: string, metadata: Record<string, any> = {}) : Promise<void> {
    // Preferred: backend creates Checkout Session
    if (PaymentConfig.backendBaseUrl) {
      const res = await fetch(`${PaymentConfig.backendBaseUrl.replace(/\/$/, '')}/payments/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, metadata })
      });
      if (!res.ok) throw new Error(`Stripe session endpoint failed: ${res.status}`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.sessionId && PaymentConfig.stripePublishableKey) {
        await this.loadScript('https://js.stripe.com/v3');
        const stripe = Stripe(PaymentConfig.stripePublishableKey);
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw error;
        return;
      }
      throw new Error('Unexpected Stripe response; expected url or sessionId');
    }

    // Fallback: Payment Link (no server)
    if (PaymentConfig.stripePaymentLinkUrl) {
      window.location.href = PaymentConfig.stripePaymentLinkUrl;
      return;
    }

    throw new Error('Stripe not configured. Provide backendBaseUrl or stripePaymentLinkUrl.');
  }

  async startGooglePay(amount: number, currency: string, metadata: Record<string, any> = {}) : Promise<void> {
    // For this demo, we route Google Pay via Stripe Checkout
    // In production, integrate Google Pay API for Web with gateway tokenization and server-side charge.
    return this.redirectStripeCheckout(amount, currency, { ...metadata, method: 'google_pay' });
  }
}