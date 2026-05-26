export interface IBrandCard {
  id: number;
  brandName: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  isVerified: boolean;
  city: string;
  country: string;
  averageRating: number;
  totalProducts: number;
}
