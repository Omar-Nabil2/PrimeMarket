import { Routes } from '@angular/router';
import { ProductDetails } from './Pages/product-details/product-details';

export const PRODUCT_DETAILS_ROUTES: Routes = [
  { path: ':id', component: ProductDetails }
];