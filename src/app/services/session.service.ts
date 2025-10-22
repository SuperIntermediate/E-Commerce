import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'ng_ecommerce_last_url_v1';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly last = signal<string>('');

  constructor() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.last.set(raw);
    } catch {}
  }

  getLastUrl(): string {
    return this.last() || '';
  }

  setLastUrl(url: string) {
    if (!url) return;
    // Avoid recording auth pages as resume targets
    const clean = url.split('?')[0];
    if (clean === '/login' || clean === '/signup') return;
    this.last.set(url);
    try {
      localStorage.setItem(STORAGE_KEY, url);
    } catch {}
  }
}