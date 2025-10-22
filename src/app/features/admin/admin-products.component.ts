import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.sass'
})
export class AdminProductsComponent {
  private readonly productService = inject(ProductService);

  readonly list = signal<Product[]>(this.productService.getAll());
  readonly categories = signal<string[]>(this.productService.getCategories());

  readonly selectedId = signal<number | null>(null);
  readonly form = signal<Omit<Product, 'id'>>({
    title: '',
    price: 0,
    category: '',
    imageUrl: '',
    description: '',
    popularity: 0,
    stock: 0,
    reviews: []
  });

  refresh() {
    this.list.set(this.productService.getAll());
    this.categories.set(this.productService.getCategories());
  }

  updateForm<K extends keyof Omit<Product, 'id'>>(key: K, value: Omit<Product, 'id'>[K]) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  selectForEdit(p: Product) {
    this.selectedId.set(p.id);
    this.form.set({
      title: p.title,
      price: p.price,
      category: p.category,
      imageUrl: p.imageUrl,
      description: p.description,
      popularity: p.popularity,
      stock: p.stock,
      reviews: p.reviews
    });
  }

  clearForm() {
    this.selectedId.set(null);
    this.form.set({ title: '', price: 0, category: '', imageUrl: '', description: '', popularity: 0, stock: 0, reviews: [] });
  }

  save() {
    const id = this.selectedId();
    const data = this.form();
    if (!data.title || !data.category) return;
    if (id) {
      this.productService.update({ id, ...data });
    } else {
      this.productService.create(data);
    }
    this.refresh();
    this.clearForm();
  }

  delete(id: number) {
    if (confirm('Delete this product?')) {
      this.productService.delete(id);
      this.refresh();
      if (this.selectedId() === id) this.clearForm();
    }
  }
}