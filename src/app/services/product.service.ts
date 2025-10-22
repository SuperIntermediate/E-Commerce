import { Injectable, signal, effect } from '@angular/core';
import { Product, Review } from '../models/product.model';

const PRODUCTS_STORAGE_KEY = 'ng_ecommerce_products_v1';
const CATEGORIES_STORAGE_KEY = 'ng_ecommerce_categories_v1';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly products = signal<Product[]>([]);
  private readonly categories = signal<string[]>([]);

  constructor() {
    const defaults: Product[] = [
      {
        id: 1,
        title: 'Wireless Headphones',
        price: 99.99,
        category: 'Electronics',
        imageUrl: 'https://picsum.photos/id/29/600/400',
        description:
          'Comfortable over-ear wireless headphones with noise cancellation and 20-hour battery life.',
        popularity: 86,
        stock: 100,
        reviews: [
          { user: 'Alice', rating: 5, comment: 'Great sound and comfort!', date: '2024-06-12' },
          { user: 'Bob', rating: 4, comment: 'Battery life is solid.', date: '2024-07-01' }
        ]
      },
      {
        id: 2,
        title: 'Smart Watch',
        price: 149.99,
        category: 'Electronics',
        imageUrl: 'https://picsum.photos/id/103/600/400',
        description: 'Water-resistant smartwatch with heart-rate monitoring and GPS tracking.',
        popularity: 120,
        stock: 100,
        reviews: [
          { user: 'Carol', rating: 4, comment: 'Love the fitness features.', date: '2024-05-20' },
          { user: 'Dave', rating: 3, comment: 'Screen could be brighter.', date: '2024-06-02' }
        ]
      },
      {
        id: 3,
        title: 'Denim Jacket',
        price: 69.99,
        category: 'Fashion',
        imageUrl: 'https://picsum.photos/id/1060/600/400',
        description: 'Classic denim jacket, perfect for layering across seasons.',
        popularity: 54,
        stock: 100,
        reviews: [
          { user: 'Ella', rating: 5, comment: 'Fits perfectly!', date: '2024-03-10' }
        ]
      },
      {
        id: 4,
        title: 'Espresso Machine',
        price: 199.99,
        category: 'Home',
        imageUrl: 'https://picsum.photos/id/1062/600/400',
        description: 'Compact espresso machine with milk frother for cafe-style drinks at home.',
        popularity: 77,
        stock: 100,
        reviews: [
          { user: 'Frank', rating: 4, comment: 'Great crema and easy to use.', date: '2024-02-18' }
        ]
      },
      {
        id: 5,
        title: 'Novel: The Wanderer',
        price: 14.99,
        category: 'Books',
        imageUrl: 'https://picsum.photos/id/24/600/400',
        description: 'A captivating journey through distant lands and self-discovery.',
        popularity: 38,
        stock: 100,
        reviews: [
          { user: 'Gina', rating: 3, comment: 'Interesting story but slow start.', date: '2024-08-30' }
        ]
      },
      {
        id: 6,
        title: 'Bluetooth Speaker',
        price: 59.99,
        category: 'Electronics',
        imageUrl: 'https://picsum.photos/id/1063/600/400',
        description: 'Portable speaker with deep bass and splash-proof design.',
        popularity: 95,
        stock: 100,
        reviews: []
      },
      {
        id: 7,
        title: 'Running Shoes',
        price: 79.99,
        category: 'Fashion',
        imageUrl: 'https://picsum.photos/id/21/600/400',
        description: 'Lightweight running shoes designed for comfort and speed.',
        popularity: 61,
        stock: 100,
        reviews: [
          { user: 'Henry', rating: 5, comment: 'Super comfortable for long runs.', date: '2024-04-14' }
        ]
      },
      {
        id: 8,
        title: 'Air Fryer',
        price: 129.99,
        category: 'Home',
        imageUrl: 'https://picsum.photos/id/1070/600/400',
        description: 'Healthy frying with minimal oil; includes multiple cooking presets.',
        popularity: 83,
        stock: 100,
        reviews: []
      }
    ];

    try {
      const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (raw) {
        const parsed: Product[] = JSON.parse(raw) || [];
        // Ensure stock exists
        const withStock = parsed.map((p) => ({ ...p, stock: (p as any).stock ?? 100 }));
        this.products.set(withStock.length ? withStock : defaults);
      } else {
        this.products.set(defaults);
      }
    } catch {
      this.products.set(defaults);
    }

    try {
      const rawC = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (rawC) {
        const parsedC: string[] = JSON.parse(rawC) || [];
        this.categories.set(parsedC.length ? parsedC : this.deriveCategories());
      } else {
        this.categories.set(this.deriveCategories());
      }
    } catch {
      this.categories.set(this.deriveCategories());
    }

    effect(() => {
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(this.products()));
      } catch {}
    });

    effect(() => {
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(this.categories()));
      } catch {}
    });
  }

  private deriveCategories(): string[] {
    const set = new Set(this.products().map((p) => p.category));
    return Array.from(set).sort();
  }

  getAll(): Product[] {
    return this.products();
  }

  getById(id: number): Product | undefined {
    return this.products().find((p) => p.id === id);
  }

  getCategories(): string[] {
    return this.categories();
  }

  private nextId(): number {
    const arr = this.products();
    return arr.length === 0 ? 1 : Math.max(...arr.map((p) => p.id)) + 1;
  }

  create(prod: Omit<Product, 'id'>): Product {
    const p: Product = { ...prod, id: this.nextId() };
    this.products.set([...this.products(), p]);
    this.categories.set(this.deriveCategories());
    return p;
  }

  update(prod: Product) {
    const list = this.products();
    const idx = list.findIndex((p) => p.id === prod.id);
    if (idx < 0) throw new Error('NOT_FOUND');
    const updated = [...list];
    updated[idx] = prod;
    this.products.set(updated);
    this.categories.set(this.deriveCategories());
  }

  delete(id: number) {
    this.products.set(this.products().filter((p) => p.id !== id));
    this.categories.set(this.deriveCategories());
  }

  addCategory(name: string) {
    const n = name.trim();
    if (!n) return;
    const set = new Set(this.categories());
    set.add(n);
    this.categories.set(Array.from(set).sort());
  }

  renameCategory(oldName: string, newName: string) {
    const o = oldName.trim();
    const n = newName.trim();
    if (!o || !n || o === n) return;
    const list = this.products().map((p) => (p.category === o ? { ...p, category: n } : p));
    this.products.set(list);
    this.categories.set(this.deriveCategories());
  }

  deleteCategory(name: string) {
    const n = name.trim();
    if (!n) return;
    // Update products in that category to 'Uncategorized' and refresh categories list
    this.products.set(this.products().map((p) => (p.category === n ? { ...p, category: 'Uncategorized' } : p)));
    this.categories.set(this.deriveCategories());
  }

  addReview(productId: number, review: Review) {
    const list = this.products();
    const idx = list.findIndex((p) => p.id === productId);
    if (idx < 0) return;
    const target = list[idx];
    const updatedProduct: Product = { ...target, reviews: [...target.reviews, review] };
    const updatedList = [...list];
    updatedList[idx] = updatedProduct;
    this.products.set(updatedList);
  }
}