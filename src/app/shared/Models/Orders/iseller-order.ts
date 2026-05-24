export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface ISellerOrderItem {
  productId: number;
  productName: string;
  productThumbnail?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ISellerOrder {
  orderId: number;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  items: ISellerOrderItem[];
}
