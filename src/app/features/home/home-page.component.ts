import { Component, OnDestroy, signal, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OptimizedImageComponent } from '../../shared/optimized-image.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, OptimizedImageComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.sass',
})
export class HomePageComponent implements OnDestroy, AfterViewInit {
  readonly slides = [
    {
      title: 'Big Savings, Fast Delivery',
      subtitle: 'Hand-picked deals, delivered to your door',
      bg: 'linear-gradient(120deg, #232f3e 0%, #37475A 50%, #FF9900 100%)',
    },
    {
      title: 'Lightning Deals',
      subtitle: 'Grab limited-time offers before they vanish',
      bg: 'linear-gradient(120deg, #0f1111 0%, #146eb4 60%, #22d3ee 100%)',
    },
    {
      title: 'New Arrivals',
      subtitle: 'Discover the latest and greatest products',
      bg: 'linear-gradient(120deg, #0f1111 0%, #1f2937 50%, #FF9900 100%)',
    },
  ];

  readonly categories = [
    { name: 'Electronics', image: '/icons/electronics.svg' },
    { name: 'Fashion', image: '/icons/fashion.svg' },
    { name: 'Home', image: '/icons/home.svg' },
    { name: 'Beauty', image: '/icons/beauty.svg' },
    { name: 'Sports', image: '/icons/sports.svg' },
    { name: 'Books', image: '/icons/books.svg' },
  ];
  active = signal(0);
  private timer: any = null;


  readonly mx = signal(0);
  readonly my = signal(0);

  constructor() {
    this.startAutoplay();
  }


  ngAfterViewInit(): void {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  }

  startAutoplay() {
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), 5000);
  }

  stopAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onHeroMove(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    this.mx.set(x * 20);
    this.my.set(y * 12);
  }

  next() {
    const i = this.active();
    this.active.set((i + 1) % this.slides.length);
  }

  prev() {
    const i = this.active();
    this.active.set((i - 1 + this.slides.length) % this.slides.length);
  }

  go(index: number) {
    this.active.set(index);
    this.startAutoplay();
  }

  flyToCart(ev: MouseEvent) {
    const btn = ev.currentTarget as HTMLElement | null;
    const cartLink = document.querySelector('a[routerLink="/cart"]') as HTMLElement | null;
    if (!btn || !cartLink) return;

    const start = btn.getBoundingClientRect();
    const end = cartLink.getBoundingClientRect();

    const ghost = document.createElement('div');
    ghost.className = 'fly-ghost';
    ghost.style.position = 'fixed';
    ghost.style.left = `${start.left + start.width / 2 - 16}px`;
    ghost.style.top = `${start.top + start.height / 2 - 16}px`;
    ghost.style.zIndex = '9999';
    document.body.appendChild(ghost);

    // Animate to cart
    requestAnimationFrame(() => {
      const dx = end.left + end.width / 2 - (start.left + start.width / 2);
      const dy = end.top + end.height / 2 - (start.top + start.height / 2);
      ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.4)`;
      ghost.style.opacity = '0';
    });

    ghost.addEventListener('transitionend', () => ghost.remove());
  }

  tilt(e: MouseEvent, ref: HTMLElement) {
    const r = ref.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; // 0..1
    const y = (e.clientY - r.top) / r.height; // 0..1
    const rotateX = (0.5 - y) * 12; // -6..6
    const rotateY = (x - 0.5) * 12; // -6..6
    ref.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    ref.style.boxShadow = `${(x - 0.5) * 10}px ${(y - 0.5) * 10}px 25px rgba(0,0,0,.25)`;
  }

  resetTilt(ref: HTMLElement) {
    ref.style.transform = 'perspective(700px) rotateX(0) rotateY(0) scale(1)';
    ref.style.boxShadow = 'none';
  }

  // Removed scrollNext/scrollPrev: no featured carousel

  ngOnDestroy(): void {
    this.stopAutoplay();
  }
}