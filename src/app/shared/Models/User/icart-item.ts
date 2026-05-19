export interface ICartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
  isAvailable: boolean;
  stock: number;
}
