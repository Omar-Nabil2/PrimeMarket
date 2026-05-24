import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../shared/Services/auth.service';
import { ToastService } from '../../../../shared/Services/toast-service';

@Component({
  selector: 'app-email-confirmation',
  imports: [CommonModule, RouterLink],
  templateUrl: './email-confirmation.html',
  styleUrl: './email-confirmation.css',
})
export class EmailConfirmation implements OnInit, OnDestroy {
  isLoading = true;
  isSuccess = false;
  message = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.confirmEmail();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private confirmEmail(): void {
    // Get userId and code from URL query parameters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const userId = params['userId'];
      const code = params['code'];

      if (!userId || !code) {
        this.isLoading = false;
        this.isSuccess = false;
        this.message = 'Invalid confirmation link. Missing userId or code.';
        this.toastService.error(this.message);
        this.cdr.detectChanges();
        return;
      }

      // Send confirmation request to backend
      this.authService.confirmEmail({ userId, code }).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isSuccess = true;
          this.message = response?.message || 'Your email has been verified successfully! Please login.';
          this.toastService.success(this.message);
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.isLoading = false;
          this.isSuccess = false;
          // Extract error message from various possible sources
          const errorMessage =
            error?.message ||
            error?.error?.message ||
            error?.error?.Errors?.[1] ||
            error?.error?.Errors?.[0] ||
            error?.error?.title ||
            'Email confirmation failed. Please try again.';
          this.message = errorMessage;
          this.toastService.error(this.message);
          this.cdr.detectChanges();
        }
      });
    });
  }
}
