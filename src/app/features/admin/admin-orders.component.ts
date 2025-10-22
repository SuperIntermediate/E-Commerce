import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.sass'
})
export class AdminOrdersComponent {
  readonly ordersSvc = inject(OrderService);
  readonly orders = signal<Order[]>(this.ordersSvc.getAll());

  readonly statuses: OrderStatus[] = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  readonly editedStatus = signal<Record<string, OrderStatus>>({});
  readonly filterStatus = signal<OrderStatus | 'ALL'>('ALL');

  refresh() {
    this.orders.set(this.ordersSvc.getAll());
  }

  filtered = computed(() => {
    const list = this.orders();
    const f = this.filterStatus();
    if (f === 'ALL') return list;
    return list.filter(o => o.status === f);
  });

  setEdit(id: string, status: OrderStatus) {
    const map = { ...this.editedStatus() };
    map[id] = status;
    this.editedStatus.set(map);
  }

  saveStatus(id: string) {
    const status = this.editedStatus()[id];
    if (!status) return;
    this.ordersSvc.updateStatus(id, status);
    this.refresh();
  }

  cancel(id: string) {
    const ok = confirm('Cancel this order?');
    if (!ok) return;
    this.ordersSvc.cancel(id);
    this.refresh();
  }
}