import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../shared/Services/auth.service';
import { ToastService } from '../../../../shared/Services/toast-service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit, OnDestroy {
  resetPasswordForm!: FormGroup;
  isLoading = true;
  isResetComplete = false;
  successMessage = '';
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.validateResetLink();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }
    return null;
  }

  private validateResetLink(): void {
    // Get userId and code from URL query parameters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const userId = params['userId'];
      const code = params['code'];

      if (!userId || !code) {
        this.isLoading = false;
        this.errorMessage = 'Invalid reset link. Missing userId or code.';
        this.toastService.error(this.errorMessage);
        this.cdr.detectChanges();
        return;
      }

      // Link is valid, hide loader
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.toastService.error('Please fill in all fields correctly');
      return;
    }

    // Get userId and code from URL
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const userId = params['userId'];
      const code = params['code'];
      const { newPassword } = this.resetPasswordForm.value;

      if (!userId || !code) {
        this.toastService.error('Invalid reset link. Please try again.');
        return;
      }

      this.resetPasswordForm.disable();

      this.authService.resetPassword({ userId, code, newPassword }).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          this.isResetComplete = true;
          this.successMessage = response?.message || 'Password reset successfully! Redirecting to login...';
          this.toastService.success(this.successMessage);
          this.cdr.detectChanges();

          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/auth']);
          }, 2000);
        },
        error: (error) => {
          this.resetPasswordForm.enable();
          this.errorMessage = error?.message || 'Failed to reset password. Please try again.';
          this.toastService.error(this.errorMessage);
          this.cdr.detectChanges();
        }
      });
    });
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }
}
