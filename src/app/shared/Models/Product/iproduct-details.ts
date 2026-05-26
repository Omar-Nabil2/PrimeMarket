import { IProductReview } from "./iproduct-review";

export interface IProductDetails {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  brandName: string | null;
  shopName: string;
  shopId: number;
  primaryImageUrl: string;
  imageUrls: string[];
  categories: string[];
  averageRating: number;
  reviewCount: number;
  reviews: IProductReview[];
}
