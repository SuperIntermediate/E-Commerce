import { Injectable, effect, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'ng_ecommerce_theme_v1';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>('light');

  constructor() {
    // Initialize from localStorage or media query
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (saved === 'dark' || saved === 'light') {
        this.theme.set(saved);
      } else {
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        this.theme.set(prefersDark ? 'dark' : 'light');
      }
    } catch {
      this.theme.set('light');
    }

    effect(() => {
      const t = this.theme();
      this.applyTheme(t);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, t);
      } catch {}
    });
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  toggle() {
    this.theme.set(this.isDark() ? 'light' : 'dark');
  }

  set(theme: Theme) {
    this.theme.set(theme);
  }

  private applyTheme(t: Theme) {
    const cls = 'theme-dark';
    const el = document.body;
    if (!el) return;
    if (t === 'dark') {
      el.classList.add(cls);
    } else {
      el.classList.remove(cls);
    }
  }
}