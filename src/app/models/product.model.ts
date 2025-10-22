export interface Review {
  user: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO string
}

export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
  popularity: number; // e.g., number of purchases or rating aggregate
  stock: number; // inventory count
  reviews: Review[];
}