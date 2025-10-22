import { Injectable, effect, signal, computed } from '@angular/core';

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number; // percent (0-100) or fixed amount
  minTotal?: number; // minimum cart total required
  maxDiscount?: number; // cap on discount amount
  expires?: string; // ISO date string
  description?: string;
}

const STORAGE_KEY = 'ng_ecommerce_coupon_v1';

@Injectable({ providedIn: 'root' })
export class CouponService {
  readonly applied = signal<Coupon | null>(null);

  // Predefined coupons for demo purposes
  private readonly available: Record<string, Coupon> = {
    SAVE10: { code: 'SAVE10', type: 'percent', value: 10, minTotal: 50, description: '10% off orders over $50' },
    WELCOME5: { code: 'WELCOME5', type: 'fixed', value: 5, description: '$5 off any order' },
    BIGSAVE20: { code: 'BIGSAVE20', type: 'percent', value: 20, minTotal: 200, maxDiscount: 50, description: '20% off $200+, max $50' }
  };

  readonly appliedCode = computed(() => this.applied()?.code ?? '');

  constructor() {
    // Load applied coupon from storage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const c: Coupon | null = JSON.parse(raw);
        if (c && this.available[c.code]) {
          this.applied.set(c);
        }
      }
    } catch {}

    // Persist applied coupon
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.applied()));
      } catch {}
    });
  }

  validate(code: string, total: number): { ok: boolean; error?: string; coupon?: Coupon } {
    const key = (code || '').trim().toUpperCase();
    const c = this.available[key];
    if (!key || !c) return { ok: false, error: 'Invalid coupon code' };
    if (c.expires && new Date(c.expires) < new Date()) return { ok: false, error: 'Coupon expired' };
    if (c.minTotal && total < c.minTotal) return { ok: false, error: `Minimum order ${c.minTotal}` };
    const potential = c.type === 'percent' ? (total * c.value / 100) : c.value;
    const maxLimited = c.maxDiscount ? Math.min(potential, c.maxDiscount) : potential;
    if (maxLimited <= 0) return { ok: false, error: 'Coupon has no effect' };
    return { ok: true, coupon: c };
  }

  apply(code: string, total: number): { ok: boolean; error?: string; coupon?: Coupon } {
    const res = this.validate(code, total);
    if (res.ok && res.coupon) {
      this.applied.set(res.coupon);
    }
    return res;
  }

  clear() {
    this.applied.set(null);
  }

  discountForTotal(total: number): number {
    const c = this.applied();
    if (!c) return 0;
    if (c.minTotal && total < c.minTotal) return 0;
    let discount = c.type === 'percent' ? (total * c.value / 100) : c.value;
    if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
    discount = Math.max(0, discount);
    return Math.min(discount, total);
  }
}