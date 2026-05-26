export type DiscountType = 0 | 1; // 0 = Percentage, 1 = Fixed Amount

export interface IPromoCode {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  usageLimit: number;
  expiresAt: string;
  isActive: boolean;
  usedCount?: number;
  createdAt?: string;
}

export interface IPromoCodeRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  usageLimit: number;
  expiresAt: string;
}

export interface IPromoCodeUpdate extends IPromoCodeRequest {
  isActive: boolean;
}
