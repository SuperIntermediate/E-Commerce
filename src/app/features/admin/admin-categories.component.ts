import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.sass'
})
export class AdminCategoriesComponent {
  private readonly products = inject(ProductService);
  readonly categories = signal<string[]>(this.products.getCategories());

  readonly newCategory = signal('');
  readonly renameFrom = signal('');
  readonly renameTo = signal('');

  refresh() {
    this.categories.set(this.products.getCategories());
  }

  add() {
    const name = this.newCategory().trim();
    if (!name) return;
    this.products.addCategory(name);
    this.newCategory.set('');
    this.refresh();
  }

  rename() {
    const from = this.renameFrom().trim();
    const to = this.renameTo().trim();
    if (!from || !to || from === to) return;
    this.products.renameCategory(from, to);
    this.renameFrom.set('');
    this.renameTo.set('');
    this.refresh();
  }

  delete(name: string) {
    const ok = confirm(`Delete category "${name}"? Products will be moved to 'Uncategorized'.`);
    if (!ok) return;
    this.products.deleteCategory(name);
    this.refresh();
  }
}