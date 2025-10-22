import { Component, computed, signal, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { ProductService } from '../../services/product.service'
import { Product } from '../../models/product.model'
import { CartService } from '../../services/cart.service'
import { toCartItem } from '../../models/cart.model'
import { AuthService } from '../../services/auth.service'
import { WishlistService } from '../../services/wishlist.service'

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.sass'
})
export class ProductsListComponent {
  private readonly productService = inject(ProductService)
  private readonly allProducts = this.productService.getAll()
  private readonly cart = inject(CartService)
  private readonly router = inject(Router)
  private readonly auth = inject(AuthService)
  readonly wishlist = inject(WishlistService)

  // UI state
  readonly searchQuery = signal('')
  readonly selectedCategory = signal<string>('all')
  readonly sortBy = signal<'price_asc' | 'price_desc' | 'popularity_desc'>('popularity_desc')

  readonly categories = signal<string[]>(['all', ...this.productService.getCategories()])

  readonly filteredProducts = computed<Product[]>(() => {
    let list = [...this.allProducts]

    // category filter
    const cat = this.selectedCategory()
    if (cat !== 'all') {
      list = list.filter((p) => p.category === cat)
    }

    // search filter
    const q = this.searchQuery().toLowerCase().trim()
    if (q.length > 0) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    // sorting
    const sort = this.sortBy()
    list.sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'popularity_desc':
        default:
          return b.popularity - a.popularity
      }
    })

    return list
  })

  constructor() {}

  setSort(value: string) {
    this.sortBy.set(value as 'price_asc' | 'price_desc' | 'popularity_desc')
  }

  addToCart(p: Product) {
    if (this.auth.isAuthenticated()) {
      this.cart.add(toCartItem(p, 1))
      // No redirect; item is added and user stays on the page
      return
    }
    // Preserve current page as redirect target after login
    const currentUrl = this.router.url || '/products'
    this.router.navigate(['/login'], {
      queryParams: { redirectUrl: currentUrl, action: 'add_to_cart', pid: p.id, qty: 1 }
    })
  }

  toggleWishlist(p: Product) {
    this.wishlist.toggle(p)
  }

  isWishlisted(p: Product): boolean {
    return this.wishlist.isWishlisted(p)
  }
}