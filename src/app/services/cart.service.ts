import { Injectable, computed, effect, signal } from '@angular/core';
import { CartItem } from '../models/cart.model';

const STORAGE_KEY = 'ng_ecommerce_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>([]);

  readonly itemCount = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));
  readonly totalPrice = computed(() => this.items().reduce((sum, i) => sum + i.price * i.quantity, 0));

  constructor() {
    // Load from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.items.set(parsed);
        }
      }
    } catch {}

    // Persist changes
    effect(() => {
      const data = JSON.stringify(this.items());
      try {
        localStorage.setItem(STORAGE_KEY, data);
      } catch {}
    });
  }

  add(item: CartItem) {
    const list = this.items();
    const idx = list.findIndex((i) => i.productId === item.productId);
    if (idx >= 0) {
      const updated = [...list];
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + item.quantity };
      this.items.set(updated);
    } else {
      this.items.set([...list, item]);
    }
  }

  remove(productId: number) {
    this.items.set(this.items().filter((i) => i.productId !== productId));
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    const list = this.items();
    const idx = list.findIndex((i) => i.productId === productId);
    if (idx >= 0) {
      const updated = [...list];
      updated[idx] = { ...updated[idx], quantity };
      this.items.set(updated);
    }
  }

  clear() {
    this.items.set([]);
  }
}