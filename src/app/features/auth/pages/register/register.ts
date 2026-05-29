import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../shared/Services/auth.service';
import { ToastService } from '../../../../shared/Services/toast-service';
import { CredentialResponse } from 'google-one-tap';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // If already logged in, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    // @ts-ignore
    window.onGoogleLibraryLoad = () => this.initGoogleSignUp();

    // @ts-ignore
    if (window.google?.accounts?.id) {
      this.initGoogleSignUp();
    }
  }

  private initGoogleSignUp(): void {
    const buttonDiv = document.getElementById('googleButtonDiv');

    if (!buttonDiv) {
      return;
    }

    // @ts-ignore
    google.accounts.id.initialize({
      client_id: '900527108026-oru43meenil4paj5pdfiqq8bgh25cn1o.apps.googleusercontent.com',
      callback: this.handleGoogleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true
    });

    // @ts-ignore
    google.accounts.id.renderButton(buttonDiv as HTMLElement, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'signup_with'
    });
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.toastService.error('Please fill in all fields correctly');
      return;
    }

    this.isLoading = true;

    const { firstName, lastName, email, password } = this.registerForm.value;

    this.authService.register({ firstName, lastName, email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.success(response?.message || 'Registration successful! Please check your email.');

        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error?.message || error?.error?.Errors?.[1] || error?.error?.Errors?.[0] || 'Registration failed. Please try again.';
        this.toastService.error(errorMessage);
      }
    });
  }

  handleGoogleCredentialResponse(response: CredentialResponse): void {
    if (!response || !response.credential) {
      this.toastService.error('No Google credential returned');
      return;
    }

    this.isLoading = true;
    this.authService.registerWithGoogle(response.credential).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Registration successful!');
        this.ngZone.run(() => {
          this.router.navigate(['/']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error(error?.message || 'Google registration failed');
      }
    });
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
