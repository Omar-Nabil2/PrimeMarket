export interface IPlaceOrderResponse {
  orderId: number;
  totalAmount: number;
  discountAmount: number;
  clientSecret: string | null;
}
