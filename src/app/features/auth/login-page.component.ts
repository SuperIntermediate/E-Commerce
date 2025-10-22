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
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.sass'
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  private readonly products = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly session = inject(SessionService);

  email = '';
  password = '';
  error = '';
  roleTarget: 'customer' | 'seller' = 'customer';

  login() {
    this.error = '';
    const qp = this.route.snapshot.queryParamMap;
    try {
      this.auth.login({ email: this.email.trim(), password: this.password });

      // Execute optional post-login action: add_to_cart
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
      if (this.auth.isAdmin()) {
        defaultRedirect = '/admin';
      } else if (this.auth.isSeller()) {
        defaultRedirect = '/seller';
      }
      const lastUrl = this.session.getLastUrl();
      this.router.navigateByUrl(redirectParam || lastUrl || defaultRedirect);
    } catch (e: any) {
      const msg = e?.message || 'Login failed';
      this.error = msg;
      // First-time login: redirect to signup with email prefilled and preserve action params
      if (msg === 'NO_ACCOUNT') {
        const params: Record<string, any> = {
          email: this.email.trim(),
          redirectUrl: qp.get('redirectUrl') || '/account'
        };
        const action = qp.get('action');
        if (action) params['action'] = action;
        const pid = qp.get('pid');
        if (pid) params['pid'] = pid;
        const qty = qp.get('qty');
        if (qty) params['qty'] = qty;
        this.router.navigate(['/signup'], { queryParams: params });
      }
    }
  }
}