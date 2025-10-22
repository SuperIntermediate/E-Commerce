import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Address } from '../../models/order.model';
import { CouponService } from '../../services/coupon.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.sass'
})
export class CheckoutPageComponent {
  readonly cart = inject(CartService);
  readonly orders = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly coupons = inject(CouponService);
  private readonly payments = inject(PaymentService);

  address: Address = {
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  };

  readonly hasItems = computed(() => this.cart.items().length > 0);

  // Coupon UI state
  readonly couponCode = signal('');
  readonly couponError = signal('');
  readonly discount = computed(() => this.coupons.discountForTotal(this.cart.totalPrice()));
  readonly totalAfterDiscount = computed(() => Math.max(0, this.cart.totalPrice() - this.discount()));
  readonly appliedCode = computed(() => this.coupons.applied()?.code ?? '');

  // Payment UI state
  readonly paymentMethod = signal<'paypal' | 'razorpay' | 'stripe' | 'gpay' | 'paytm' | 'upi'>('paypal');
  readonly isPaying = signal(false);
  readonly upiVpa = signal('');

  isAddressValid(): boolean {
    const a = this.address;
    return !!(a.name && a.email && a.line1 && a.city && a.state && a.postalCode && a.country);
  }

  applyCoupon() {
    const res = this.coupons.apply(this.couponCode().trim(), this.cart.totalPrice());
    this.couponError.set(res.ok ? '' : (res.error || 'Invalid coupon'));
  }

  clearCoupon() {
    this.coupons.clear();
    this.couponError.set('');
  }

  placeOrder() {
    if (!this.hasItems() || !this.isAddressValid()) return;
    const currentUser = this.auth.user();
    if (!currentUser) {
      alert('Please log in to place an order.');
      return;
    }
    const order = this.orders.place(this.address, this.cart.items(), currentUser.id);
    this.cart.clear();
    this.coupons.clear();
    this.router.navigate(['/orders'], { queryParams: { placed: order.id } });
  }

  // Payment flows
  renderPayPalButtons() {
    if (!this.hasItems() || !this.isAddressValid()) return;
    this.isPaying.set(true);
    const amount = this.totalAfterDiscount();
    this.payments
      .renderPayPalButtons('#paypal-buttons', amount, (details) => {
        // On success, place order
        this.isPaying.set(false);
        this.placeOrder();
      }, (err) => {
        console.error('PayPal error', err);
        this.isPaying.set(false);
        alert('PayPal payment failed. Please try again.');
      })
      .catch((e) => {
        console.error(e);
        this.isPaying.set(false);
        alert('Failed to initialize PayPal. Check configuration.');
      });
  }

  payWithRazorpay() {
    if (!this.hasItems() || !this.isAddressValid()) return;
    this.isPaying.set(true);
    const amount = this.totalAfterDiscount();
    const a = this.address;
    this.payments.openRazorpayCheckout(
      amount,
      'Order Payment',
      'Angular Shopping Site',
      { name: a.name, email: a.email, contact: a.phone },
      (resp) => {
        // On success, place order
        this.isPaying.set(false);
        this.placeOrder();
      },
      (err) => {
        console.error('Razorpay error', err);
        this.isPaying.set(false);
        alert('Razorpay payment failed. Please try again.');
      }
    );
  }

  payWithStripe() {
    if (!this.hasItems() || !this.isAddressValid()) return;
    this.isPaying.set(true);
    const amount = this.totalAfterDiscount();
    // Currency comes from DEFAULT_CURRENCY_CODE in app.config.ts (INR)
    this.payments
      .redirectStripeCheckout(amount, 'INR', { email: this.address.email })
      .catch((err) => {
        console.error('Stripe error', err);
        alert('Stripe checkout failed. Check configuration.');
      })
      .finally(() => this.isPaying.set(false));
  }

  payWithUpi() {
    if (!this.hasItems() || !this.isAddressValid()) return;
    this.isPaying.set(true);
    const amount = this.totalAfterDiscount();
    const a = this.address;
    const vpa = (this.upiVpa() || '').trim();
    this.payments.openRazorpayCheckout(
      amount,
      'Order Payment',
      'Angular Shopping Site',
      { name: a.name, email: a.email, contact: a.phone },
      (resp) => {
        this.isPaying.set(false);
        this.placeOrder();
      },
      (err) => {
        console.error('UPI/Razorpay error', err);
        this.isPaying.set(false);
        alert('UPI payment failed. Please try again.');
      },
      'upi',
      vpa || undefined
    );
  }

  payWithPaytm() {
    if (!this.hasItems() || !this.isAddressValid()) return;
    this.isPaying.set(true);
    const amount = this.totalAfterDiscount();
    const customerId = this.address.email || this.address.phone || 'guest';
    this.payments.openPaytmCheckout(
      amount,
      customerId,
      (resp) => {
        this.isPaying.set(false);
        this.placeOrder();
      },
      (err) => {
        console.error('Paytm error', err);
        this.isPaying.set(false);
        alert('Paytm payment failed. Check configuration and backend.');
      }
    );
  }

  payWithGooglePay() {
    if (!this.hasItems() || !this.isAddressValid()) return;
    this.isPaying.set(true);
    const amount = this.totalAfterDiscount();
    this.payments
      .startGooglePay(amount, 'INR', { email: this.address.email })
      .catch((err) => {
        console.error('Google Pay error', err);
        alert('Google Pay failed to start. Check configuration.');
      })
      .finally(() => this.isPaying.set(false));
  }
}