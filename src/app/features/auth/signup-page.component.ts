import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { toCartItem } from '../../models/cart.model';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.sass'
})
export class SignupPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  private readonly products = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly session = inject(SessionService);

  name = '';
  email = '';
  password = '';
  error = '';
  role: 'customer' | 'seller' = 'customer';

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    const prefillEmail = qp.get('email');
    if (prefillEmail) this.email = prefillEmail;
  }

  signup() {
    this.error = '';
    try {
      this.auth.signup({ name: this.name.trim(), email: this.email.trim(), password: this.password, role: this.role });

      // Optional post-signup action: add_to_cart and redirect
      const qp = this.route.snapshot.queryParamMap;
      const action = qp.get('action');
      if (action === 'add_to_cart') {
        const pidStr = qp.get('pid');
        const qtyStr = qp.get('qty');
        const pid = pidStr ? Number(pidStr) : NaN;
        const qty = qtyStr ? Number(qtyStr) : 1;
        const product = this.products.getById(pid);
        if (product) {
          this.cart.add(toCartItem(product, Math.max(1, qty)));
        }
      }

      const redirectParam = qp.get('redirectUrl');
      let defaultRedirect = '/account';
      const role = this.auth.user()?.role;
      if (role === 'admin') {
        defaultRedirect = '/admin';
      } else if (role === 'seller') {
        defaultRedirect = '/seller';
      }
      const lastUrl = this.session.getLastUrl();
      this.router.navigateByUrl(redirectParam || lastUrl || defaultRedirect);
    } catch (e: any) {
      this.error = e?.message || 'Signup failed';
    }
  }
}