export interface IBrandProduct {
    id: number;
  name: string;
  brandName: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  primaryImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
}
