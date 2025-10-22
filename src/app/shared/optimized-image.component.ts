import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img
      [src]="currentSrc"
      [attr.alt]="alt"
      [attr.width]="width"
      [attr.height]="height"
      [attr.sizes]="sizes"
      [attr.srcset]="srcset"
      [attr.crossorigin]="'anonymous'"
      [attr.referrerpolicy]="'no-referrer'"
      loading="lazy"
      decoding="async"
      (error)="onError($event)"
      style="display:block;width:100%;height:100%;object-fit:cover;border-top-left-radius:inherit;border-top-right-radius:inherit"
    />
  `,
})
export class OptimizedImageComponent {
  @Input({ required: true }) src!: string;
  @Input() alt: string = '';
  @Input() width?: number;
  @Input() height?: number;
  @Input() sizes?: string;
  @Input() densities: number[] = [1, 2];
  @Input() fallbackSrc: string = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="Arial" font-size="20">Image unavailable</text></svg>';

  currentSrc: string = '';

  ngOnInit() {
    this.currentSrc = this.src;
  }

  ngOnChanges() {
    this.currentSrc = this.src;
  }

  onError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && this.currentSrc !== this.fallbackSrc) {
      this.currentSrc = this.fallbackSrc;
    }
  }

  get srcset(): string | null {
    if (!this.src || !this.densities || this.densities.length <= 1) return null;
    return this.densities.map((d) => `${this.src} ${d}x`).join(', ');
  }
}