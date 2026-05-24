export interface IOrderDetails {
  id: number;
  totalAmount: number;
  discountAmount: number;
  estimatedDelivery: string;
  address: string;
  items: {
    id: number;
    name: string;
    imageUrl: string;
    quantity: number;
    subtotal: number;
  }[];
}
