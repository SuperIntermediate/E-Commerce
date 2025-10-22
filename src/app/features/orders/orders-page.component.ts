import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.sass'
})
export class OrdersPageComponent {
  private readonly orderService = inject(OrderService);
  private readonly auth = inject(AuthService);

  // Computed property to get only current user's orders
  readonly orders = computed(() => {
    const currentUser = this.auth.user();
    if (!currentUser) return [];
    return this.orderService.getByUserId(currentUser.id);
  });

  cancel(id: string) {
    const ok = confirm('Are you sure you want to cancel this order?');
    if (!ok) return;
    this.orderService.cancel(id);
  }
}