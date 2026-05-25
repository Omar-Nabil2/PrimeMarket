export interface IAdminProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  primaryImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  categories: string[];
  sellerName: string;
  createdAt: string;
}