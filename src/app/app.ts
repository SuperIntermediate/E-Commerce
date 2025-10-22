import { Component, inject, signal } from '@angular/core'
import { RouterOutlet, RouterLink } from '@angular/router'
import { Router, NavigationEnd } from '@angular/router'
import { CartService } from './services/cart.service'
import { AuthService } from './services/auth.service'
import { ThemeService } from './services/theme.service'
import { WishlistService } from './services/wishlist.service'
import { SessionService } from './services/session.service'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.sass'
})
export class App {
  protected readonly title = signal('angular-shopping-site')
  readonly cart = inject(CartService)
  readonly auth = inject(AuthService)
  readonly theme = inject(ThemeService)
  readonly wishlist = inject(WishlistService)
  readonly menuOpen = signal(false)
  private readonly router = inject(Router)
  private readonly session = inject(SessionService)

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.session.setLastUrl(this.router.url)
      }
    })
  }

  toggleMenu() {
    this.menuOpen.update(v => !v)
  }

  closeMenu() {
    this.menuOpen.set(false)
  }

  // Close mobile menu with Escape key for accessibility
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeMenu()
    }
  }
}
