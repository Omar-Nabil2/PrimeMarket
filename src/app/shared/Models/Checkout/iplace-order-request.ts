export interface IPlaceOrderRequest {
  addressId: number;
  paymentMethod: PaymentType;
  promoCode: string | null;
}

export enum PaymentType {
  CreditCard = 0,
  PayPal = 1,
  Wallet = 2,
  COD = 3
}
