export interface ISellerProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  primaryImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  categories: string[];
}