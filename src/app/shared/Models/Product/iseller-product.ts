export interface ISellerProduct {
  id: number;
  name: string;
  price: number;
  brandName: string;
  stock: number;
  isActive: boolean;
  primaryImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  categories: string[];
  createdAt: string;
}