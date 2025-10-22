import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.sass'
})
export class AccountPageComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  tokenSnippet(): string {
    const t = this.auth.token();
    if (!t) return '';
    return `${t.slice(0, 12)}…${t.slice(-6)}`;
  }
}