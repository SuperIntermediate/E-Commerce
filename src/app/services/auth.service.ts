import { Injectable, computed, effect, signal } from '@angular/core';
import { AuthState, SignupPayload, Credentials, User, RegisteredUser, createFakeJwt, UserRole } from '../models/auth.model';

const STORAGE_KEY = 'ng_ecommerce_auth_v1';
const USERS_STORAGE_KEY = 'ng_ecommerce_users_v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(null);
  readonly user = signal<User | null>(null);
  readonly usersByEmail = signal<Record<string, RegisteredUser>>({});

  readonly isAuthenticated = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.user()?.role === 'admin');
  readonly isSeller = computed(() => this.user()?.role === 'seller');

  constructor() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: AuthState = JSON.parse(raw);
        this.token.set(parsed?.token ?? null);
        this.user.set(parsed?.user ?? null);
      }
    } catch {}

    try {
      const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
      let parsedUsers: Record<string, RegisteredUser> = {};
      if (rawUsers) {
        parsedUsers = JSON.parse(rawUsers) || {};
      }
      // Ensure role exists on every stored user; default to 'customer'
      const normalized: Record<string, RegisteredUser> = {};
      for (const [email, u] of Object.entries(parsedUsers)) {
        normalized[email] = { ...u, role: (u as any).role ?? 'customer' } as RegisteredUser;
      }
      // Seed default admin and seller if no users exist
      if (Object.keys(normalized).length === 0) {
        const adminEmail = 'admin@example.com';
        normalized[adminEmail] = {
          id: 'U-admin',
          name: 'Admin',
          email: adminEmail,
          password: 'admin',
          role: 'admin'
        } as RegisteredUser;
        const sellerEmail = 'seller@example.com';
        normalized[sellerEmail] = {
          id: 'U-seller',
          name: 'Seller',
          email: sellerEmail,
          password: 'seller',
          role: 'seller'
        } as RegisteredUser;
      }
      this.usersByEmail.set(normalized);
    } catch {}

    effect(() => {
      const state: AuthState = { token: this.token(), user: this.user() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    });

    effect(() => {
      const users = this.usersByEmail();
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch {}
    });
  }

  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  hasUser(email: string): boolean {
    const e = this.normalize(email);
    const users = this.usersByEmail();
    return !!users[e];
  }

  login({ email, password }: Credentials): User {
    if (!email || !password) throw new Error('Email and password are required');
    const e = this.normalize(email);
    const users = this.usersByEmail();
    const existing = users[e];
    if (!existing) throw new Error('NO_ACCOUNT');
    if (existing.password !== password) throw new Error('BAD_CREDENTIALS');
    const role: UserRole = (existing as any).role ?? 'customer';
    const user: User = { id: existing.id, name: existing.name, email: existing.email, role };
    const token = createFakeJwt({ sub: user.id, email: user.email, name: user.name, role });
    this.user.set(user);
    this.token.set(token);
    return user;
  }

  signup({ name, email, password, role }: SignupPayload): User {
    if (!name || !email || !password) throw new Error('Name, email, and password are required');
    const e = this.normalize(email);
    const users = { ...this.usersByEmail() };
    if (users[e]) throw new Error('ACCOUNT_EXISTS');
    const newUser: RegisteredUser = { id: `U-${Date.now()}`, name: name.trim(), email: e, password, role: role ?? 'customer' };
    users[e] = newUser;
    this.usersByEmail.set(users);

    const publicUser: User = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    const token = createFakeJwt({ sub: publicUser.id, email: publicUser.email, name: publicUser.name, role: publicUser.role });
    this.user.set(publicUser);
    this.token.set(token);
    return publicUser;
  }

  logout() {
    this.user.set(null);
    this.token.set(null);
  }

  // Admin utilities
  getRegisteredUsers(): RegisteredUser[] {
    return Object.values(this.usersByEmail()).sort((a, b) => a.email.localeCompare(b.email));
  }

  updateUserRole(email: string, role: UserRole) {
    const e = this.normalize(email);
    const users = { ...this.usersByEmail() };
    const existing = users[e];
    if (!existing) throw new Error('NO_ACCOUNT');
    users[e] = { ...existing, role };
    this.usersByEmail.set(users);
    // If the currently logged in user is updated, reflect change
    const current = this.user();
    if (current && this.normalize(current.email) === e) {
      this.user.set({ ...current, role });
      const token = createFakeJwt({ sub: current.id, email: current.email, name: current.name, role });
      this.token.set(token);
    }
  }

  deleteUser(email: string) {
    const e = this.normalize(email);
    const users = { ...this.usersByEmail() };
    if (!users[e]) throw new Error('NO_ACCOUNT');
    delete users[e];
    this.usersByEmail.set(users);
    const current = this.user();
    if (current && this.normalize(current.email) === e) {
      this.logout();
    }
  }
}