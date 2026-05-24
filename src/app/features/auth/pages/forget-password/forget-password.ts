import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../shared/Services/auth.service';
import { ToastService } from '../../../../shared/Services/toast-service';

@Component({
  selector: 'app-forget-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})
export class ForgetPassword implements OnInit, OnDestroy {
  forgetPasswordForm!: FormGroup;
  isLoading = false;
  isSuccess = false;
  successMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // If already logged in, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgetPasswordForm.invalid) {
      this.toastService.error('Please enter a valid email address');
      return;
    }

    this.isLoading = true;
    const { email } = this.forgetPasswordForm.value;

    this.authService.forgetPassword({ email }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.successMessage = response?.message || 'Password reset link sent successfully! Please check your email.';
        this.toastService.success(this.successMessage);
        this.cdr.detectChanges();

        // Reset form after success
        setTimeout(() => {
          this.forgetPasswordForm.reset();
          this.isSuccess = false;
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error?.message || 'Failed to send password reset link. Please try again.';
        this.toastService.error(errorMessage);
        this.cdr.detectChanges();
      }
    });
  }

  get email() {
    return this.forgetPasswordForm.get('email');
  }
}
