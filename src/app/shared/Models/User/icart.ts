import { ICartItem } from "./icart-item";

export interface ICart {
items: ICartItem[];
  total: number;
  itemCount: number;
}
