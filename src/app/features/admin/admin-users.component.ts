import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisteredUser, UserRole } from '../../models/auth.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.sass'
})
export class AdminUsersComponent {
  readonly auth = inject(AuthService);
  readonly users = signal<RegisteredUser[]>(this.auth.getRegisteredUsers());

  readonly roles: UserRole[] = ['customer', 'seller', 'admin'];
  readonly roleByEmail = signal<Record<string, UserRole>>({});

  currentAdminEmail = computed(() => this.auth.user()?.email ?? '');

  refresh() {
    this.users.set(this.auth.getRegisteredUsers());
  }

  changeRole(email: string, role: UserRole) {
    const map = { ...this.roleByEmail() };
    map[email] = role;
    this.roleByEmail.set(map);
  }

  saveRole(email: string) {
    const role = this.roleByEmail()[email];
    if (!role) return;
    this.auth.updateUserRole(email, role);
    this.refresh();
  }

  delete(email: string) {
    const isSelf = this.currentAdminEmail() === email;
    const warn = isSelf ? 'This will log you out.' : '';
    const ok = confirm(`Delete user ${email}? ${warn}`);
    if (!ok) return;
    this.auth.deleteUser(email);
    this.refresh();
  }
}