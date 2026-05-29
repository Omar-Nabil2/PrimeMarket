import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../shared/Services/auth.service';
import { ToastService } from '../../../../shared/Services/toast-service';
import {CredentialResponse} from 'google-one-tap';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private ngZone: NgZone
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

   this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.toastService.success('Login successful!');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error(error.message || 'Login failed. Please try again.');
      }
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  ngOnInit(): void {
    // @ts-ignore
    window.onGoogleLibraryLoad = () => this.initGoogleSignIn();

    // If the Google script already loaded before this component initialized,
    // initialize immediately instead of waiting for the callback.
    // @ts-ignore
    if (window.google?.accounts?.id) {
      this.initGoogleSignIn();
    }
  }

  private initGoogleSignIn(): void {
    const buttonDiv = document.getElementById('buttonDiv');

    if (!buttonDiv) {
      return;
    }

    // @ts-ignore
    google.accounts.id.initialize({
      client_id: '900527108026-oru43meenil4paj5pdfiqq8bgh25cn1o.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true
    });

    // @ts-ignore
    google.accounts.id.renderButton(buttonDiv as HTMLElement, {
      theme: 'outline',
      size: 'large',
      width: 320
    });

  }

  handleCredentialResponse(response: CredentialResponse): void {
    if (!response || !response.credential) {
      this.toastService.error('No Google credential returned');
      return;
    }

    this.isLoading = true;
    this.authService.loginWithGoogle(response.credential).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Login successful!');
        this.ngZone.run(() => {
          this.router.navigate(['/']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error(error?.message || 'Google login failed');
      }
    });
  }
}
