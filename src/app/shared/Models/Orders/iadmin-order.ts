import { OrderStatus } from "./order-status";

export interface IAdminOrderItem {
  productId: number;
  productName: string;
  productThumbnail?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sellerUserName: string;
}

export interface IAdminOrder {
  orderId: number;
  customerUserName: string;
  customerEmail: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  items: IAdminOrderItem[];
}
