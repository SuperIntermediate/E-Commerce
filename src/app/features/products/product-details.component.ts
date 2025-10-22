import { Component, signal, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { ProductService } from '../../services/product.service'
import { Product } from '../../models/product.model'
import { CartService } from '../../services/cart.service'
import { toCartItem } from '../../models/cart.model'
import { AuthService } from '../../services/auth.service'
import { WishlistService } from '../../services/wishlist.service'

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.sass'
})
export class ProductDetailsComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly productService = inject(ProductService)
  readonly quantity = signal(1)
  private readonly cart = inject(CartService)
  readonly auth = inject(AuthService)
  private readonly router = inject(Router)
  readonly wishlist = inject(WishlistService)

  readonly product = signal<Product | null>(null)
  readonly reviewRating = signal<number>(5)
  readonly reviewComment = signal<string>('')

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id')
    const id = idParam ? Number(idParam) : NaN
    const found = this.productService.getById(id)
    this.product.set(found ?? null)
  }

  addToCart() {
    const p = this.product()
    if (!p) return
    const qty = this.quantity()
    if (this.auth.isAuthenticated()) {
      this.cart.add(toCartItem(p, qty))
      return
    }
    const currentUrl = this.router.url || `/products/${p.id}`
    this.router.navigate(['/login'], {
      queryParams: { redirectUrl: currentUrl, action: 'add_to_cart', pid: p.id, qty }
    })
  }

  toggleWishlist() {
    const p = this.product()
    if (!p) return
    this.wishlist.toggle(p)
  }

  isWishlisted(): boolean {
    const p = this.product()
    return p ? this.wishlist.isWishlisted(p) : false
  }

  submitReview() {
    const p = this.product()
    if (!p) return
    if (!this.auth.isAuthenticated()) {
      const currentUrl = this.router.url || `/products/${p.id}`
      this.router.navigate(['/login'], {
        queryParams: { redirectUrl: currentUrl, action: 'write_review', pid: p.id }
      })
      return
    }
    const user = this.auth.user()
    const review = {
      user: user?.name || 'Anonymous',
      rating: this.reviewRating(),
      comment: this.reviewComment().trim(),
      date: new Date().toISOString().slice(0, 10)
    }
    if (!review.comment) return
    this.productService.addReview(p.id, review)
    const updated = this.productService.getById(p.id)
    this.product.set(updated ?? p)
    this.reviewRating.set(5)
    this.reviewComment.set('')
  }
}