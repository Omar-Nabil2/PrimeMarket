import { IOrderAddress } from "./iorder-address";
import { OrderStatus } from "./order-status";

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
  address: IOrderAddress;
  items: ISellerOrderItem[];
}
