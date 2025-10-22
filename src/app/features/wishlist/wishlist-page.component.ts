import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { toCartItem } from '../../models/cart.model';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './wishlist-page.component.html',
  styleUrl: './wishlist-page.component.sass'
})
export class WishlistPageComponent {
  readonly wishlist = inject(WishlistService);
  readonly cart = inject(CartService);

  remove(productId: number) {
    const p = this.wishlist.products().find((i) => i.id === productId);
    if (p) this.wishlist.remove(p);
  }

  addToCart(productId: number) {
    const p = this.wishlist.products().find((i) => i.id === productId);
    if (!p) return;
    this.cart.add(toCartItem(p, 1));
  }

  clear() {
    this.wishlist.clear();
  }
}