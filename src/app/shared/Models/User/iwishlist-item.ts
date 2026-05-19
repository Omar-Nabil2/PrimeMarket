export interface IWishlistItem {
 id: number;
  productId: number;
  name: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string | null;
  category: string | null;
  rating: number;
  reviewCount: number;
}
