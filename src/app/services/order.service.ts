import { Injectable, effect, signal } from '@angular/core';
import { Address, Order, OrderStatus, orderItemsFromCart } from '../models/order.model';
import { CartItem } from '../models/cart.model';

const STORAGE_KEY = 'ng_ecommerce_orders_v1';

@Injectable({ providedIn: 'root' })
export class OrderService {
  readonly orders = signal<Order[]>([]);

  constructor() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Order[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.orders.set(parsed);
        }
      }
    } catch {}

    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders()));
      } catch {}
    });
  }

  private generateId(): string {
    return `ORD-${Date.now()}`;
  }

  place(address: Address, cartItems: CartItem[], userId: string): Order {
    const items = orderItemsFromCart(cartItems);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order: Order = {
      id: this.generateId(),
      date: new Date().toISOString(),
      items,
      total,
      address,
      status: 'PLACED',
      userId
    };
    this.orders.set([order, ...this.orders()]);
    return order;
  }

  cancel(id: string): Order | undefined {
    const list = this.orders();
    const idx = list.findIndex((o) => o.id === id);
    if (idx < 0) return undefined;
    const target = list[idx];
    if (target.status !== 'PLACED') return target; // Only allow cancelling placed orders
    const updated: Order = { ...target, status: 'CANCELLED' };
    const next = [...list];
    next[idx] = updated;
    this.orders.set(next);
    return updated;
  }

  getAll(): Order[] {
    return this.orders();
  }

  getByUserId(userId: string): Order[] {
    return this.orders().filter((o) => o.userId === userId);
  }

  getById(id: string): Order | undefined {
    return this.orders().find((o) => o.id === id);
  }

  updateStatus(id: string, status: OrderStatus): Order | undefined {
    const list = this.orders();
    const idx = list.findIndex((o) => o.id === id);
    if (idx < 0) return undefined;
    const target = list[idx];
    if (target.status === 'CANCELLED') return target; // Can't change cancelled orders
    const updated: Order = { ...target, status };
    const next = [...list];
    next[idx] = updated;
    this.orders.set(next);
    return updated;
  }
}