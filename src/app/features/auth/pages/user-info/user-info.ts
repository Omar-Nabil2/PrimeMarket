import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../shared/Services/auth.service';
import { ToastService } from '../../../../shared/Services/toast-service';
import { UserInfo } from '../../../../shared/Models/auth.model';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css',
})
export class UserInfoComponent implements OnInit, OnDestroy {
  userInfo: UserInfo | null = null;
  editForm!: FormGroup;
  changePasswordForm!: FormGroup;
  isLoadingUserInfo = true;
  isEditing = false;
  isSavingInfo = false;
  isChangingPassword = false;
  showChangePasswordForm = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
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

  private loadUserInfo(): void {
    this.isLoadingUserInfo = true;
    this.authService.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe({
      next: (info) => {
        this.userInfo = info;
        this.editForm.patchValue({
          firstName: info.firstName,
          lastName: info.lastName
        });
        this.isLoadingUserInfo = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoadingUserInfo = false;
        const errorMessage = error?.message || 'Failed to load user information';
        this.toastService.error(errorMessage);
        this.cdr.detectChanges();
      }
    });
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form when canceling edit
      if (this.userInfo) {
        this.editForm.patchValue({
          firstName: this.userInfo.firstName,
          lastName: this.userInfo.lastName
        });
      }
    }
  }

  onSaveUserInfo(): void {
    if (this.editForm.invalid) {
      this.toastService.error('Please fill in all fields correctly');
      return;
    }

    this.isSavingInfo = true;
    const { firstName, lastName } = this.editForm.value;

    this.authService.updateUserInfo({ firstName, lastName }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isSavingInfo = false;
        this.toastService.success('Profile updated successfully!');
        this.isEditing = false;
        // Reload user info to get fresh data
        this.loadUserInfo();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSavingInfo = false;
        const errorMessage = error?.message || 'Failed to update profile';
        this.toastService.error(errorMessage);
        this.cdr.detectChanges();
      }
    });
  }

  toggleChangePasswordForm(): void {
    this.showChangePasswordForm = !this.showChangePasswordForm;
    if (!this.showChangePasswordForm) {
      this.changePasswordForm.reset();
    }
  }

  onChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.toastService.error('Please fill in all fields correctly');
      return;
    }

    this.isChangingPassword = true;
    const { currentPassword, newPassword } = this.changePasswordForm.value;

    this.authService.changePassword({ currentPassword, newPassword }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.isChangingPassword = false;
        this.toastService.success(response?.message || 'Password changed successfully!');
        this.changePasswordForm.reset();
        this.showChangePasswordForm = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isChangingPassword = false;
        const errorMessage = error?.message || 'Failed to change password';
        this.toastService.error(errorMessage);
        this.cdr.detectChanges();
      }
    });
  }

  get firstName() {
    return this.editForm.get('firstName');
  }

  get lastName() {
    return this.editForm.get('lastName');
  }

  get currentPassword() {
    return this.changePasswordForm.get('currentPassword');
  }

  get newPassword() {
    return this.changePasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }
}
