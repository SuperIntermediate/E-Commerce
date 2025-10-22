import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.sass'
})
export class CartPageComponent {
  readonly cart = inject(CartService);

  readonly hasItems = computed(() => this.cart.items().length > 0);

  updateQty(id: number, qty: number) {
    this.cart.updateQuantity(id, Math.max(1, qty));
  }
}