import { Injectable, effect, signal } from '@angular/core';
import { Product } from '../models/product.model';

const WISHLIST_STORAGE_KEY = 'ng_ecommerce_wishlist_v1';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  readonly products = signal<Product[]>([]);
  readonly count = signal(0);

  constructor() {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        this.products.set(JSON.parse(saved));
      }
    } catch {
      // No wishlist saved
    }

    effect(() => {
      const p = this.products();
      this.count.set(p.length);
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(p));
      } catch {}
    });
  }

  isWishlisted(p: Product): boolean {
    return this.products().some((i) => i.id === p.id);
  }

  toggle(p: Product) {
    if (this.isWishlisted(p)) {
      this.products.set(this.products().filter((i) => i.id !== p.id));
    } else {
      this.products.set([p, ...this.products()]);
    }
  }

  remove(p: Product) {
    this.products.set(this.products().filter((i) => i.id !== p.id));
  }

  clear() {
    this.products.set([]);
  }
}