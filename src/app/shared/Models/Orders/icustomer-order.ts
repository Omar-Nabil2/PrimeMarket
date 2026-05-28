import { IOrderAddress } from "./iorder-address";
import { OrderStatus } from "./order-status";

export interface ICustomerOrderItem {
  productId: number;
  productName: string;
  productThumbnail?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sellerUserName: string;
}

export interface ICustomerOrder {
  orderId: number;
   orderDate: string;
   status: OrderStatus;
   totalAmount: number;
   paymentMethod: string;
   address: IOrderAddress;
  items: ICustomerOrderItem[];
}
