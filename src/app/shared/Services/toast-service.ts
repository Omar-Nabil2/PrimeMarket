import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
   private toastr = inject(ToastrService);

  success(message: string) {
    this.toastr.success(message);
  }

  error(message: string) {
    this.toastr.error(message);
  }

  info(message: string) {
    this.toastr.info(message);
  }
  handleError(err: any): Observable<never> {
    const message = err.error?.Errors?.[1] ?? 'Something went wrong';
    this.toastr.error(message);
    return EMPTY;
  }
}
