import { CartItem } from './cart.model';

export interface Address {
  name: string;
  email: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: number;
  title: string;
  price: number;
  imageUrl: string;
  category: string;
  quantity: number;
}

export type OrderStatus = 'PLACED' | 'CANCELLED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';

export interface Order {
  id: string;
  date: string; // ISO string
  items: OrderItem[];
  total: number;
  address: Address;
  status: OrderStatus;
  userId: string; // ID of the user who placed the order
}

export function orderItemsFromCart(cartItems: CartItem[]): OrderItem[] {
  return cartItems.map((i) => ({
    productId: i.productId,
    title: i.title,
    price: i.price,
    imageUrl: i.imageUrl,
    category: i.category,
    quantity: i.quantity
  }));
}