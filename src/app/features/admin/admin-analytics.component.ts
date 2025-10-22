import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order, OrderItem } from '../../models/order.model';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.sass'
})
export class AdminAnalyticsComponent {
  readonly ordersSvc = inject(OrderService);

  readonly orders = computed<Order[]>(() => this.ordersSvc.orders());

  readonly nonCancelled = computed(() => this.orders().filter(o => o.status !== 'CANCELLED'));

  readonly totalRevenue = computed(() =>
    this.nonCancelled().reduce((sum, o) => sum + o.total, 0)
  );

  readonly statusCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const o of this.orders()) {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    }
    return counts;
  });

  readonly revenueByMonth = computed(() => {
    const map: Record<string, number> = {};
    for (const o of this.nonCancelled()) {
      const d = new Date(o.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] ?? 0) + o.total;
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  });

  readonly topProducts = computed(() => {
    const units: Record<number, { title: string; quantity: number }> = {};
    for (const o of this.nonCancelled()) {
      for (const i of o.items) {
        units[i.productId] = units[i.productId] ?? { title: i.title, quantity: 0 };
        units[i.productId].quantity += i.quantity;
      }
    }
    return Object.values(units).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  });

  readonly revenueByCategory = computed(() => {
    const map: Record<string, number> = {};
    for (const o of this.nonCancelled()) {
      for (const i of o.items) {
        map[i.category] = (map[i.category] ?? 0) + i.price * i.quantity;
      }
    }
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const max = entries.length ? entries[0][1] : 0;
    return { entries, max };
  });
}