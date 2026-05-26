import { CanActivateFn, Router } from "@angular/router";
import { IBrandService } from "../../shared/Services/ibrand-service";
import { ToastService } from "../../shared/Services/toast-service";
import { inject } from "@angular/core";
import { catchError, map, of } from "rxjs";

export const becomeSellerGuard: CanActivateFn = () => {
  const brandService = inject(IBrandService);
  const toast = inject(ToastService);
  const router = inject(Router);

  return brandService.getStatus().pipe(
    map(() => true),
    catchError((err) => {
      const message = err.error?.Errors?.[1] ?? 'Something went wrong.';

      if (err.status === 409 || err.status === 400) {
        toast.info(message);
      } else {
        toast.error(message);
      }

      router.navigate(['/']);
      return of(false);
    })
  );
};