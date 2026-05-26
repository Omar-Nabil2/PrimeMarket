import { IBrandProduct } from "./ibrand-product";

export interface IBrandDetails {
  id: number;
  brandName: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  isVerified: boolean;
  street: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  sellerName: string;
  averageRating: number;
  totalReviews: number;
  products: IBrandProduct[];
}
