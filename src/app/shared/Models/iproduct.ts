export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  primaryImageUrl: string;
  sellerName: string;
  categories: string[];
  averageRating: number;
  reviewCount: number;
  orderCount: number;
}
