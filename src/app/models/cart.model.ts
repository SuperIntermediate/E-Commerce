import { Product } from './product.model';

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  imageUrl: string;
  category: string;
  quantity: number;
}

export function toCartItem(product: Product, quantity = 1): CartItem {
  return {
    productId: product.id,
    title: product.title,
    price: product.price,
    imageUrl: product.imageUrl,
    category: product.category,
    quantity
  };
}