import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse, ConfirmEmailRequest, ConfirmEmailResponse, ForgetPasswordRequest, ForgetPasswordResponse, ResetPasswordRequest, ResetPasswordResponse, UserInfo, ChangePasswordRequest, ChangePasswordResponse, ProfileImageResponse, AuthState } from '../Models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly apiUrl = `${this.baseUrl}/api/auth`;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  // Signals for reactive state management
  authState = signal<AuthState>({
    isAuthenticated: this.isTokenValid(),
    user: this.getSavedUser(),
    token: this.getToken()
  });

  constructor(private http: HttpClient) {
    this.initializeAuthState();
  }

  /**
   * Initialize auth state from stored data
   */
  private initializeAuthState(): void {
    const token = this.getToken();
    const user = this.getSavedUser();
    if (token && user && !this.isTokenExpired(token)) {
      this.authState.set({
        isAuthenticated: true,
        user,
        token
      });
    } else {
      this.logout();
    }
  }

  /**
   * Login user with email and password
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, { email, password }).pipe(
      tap((response: AuthResponse) => {
        this.setToken(response.token);
        this.setUser(response);
        this.authState.set({
          isAuthenticated: true,
          user: response,
          token: response.token
        });
      }),
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Login failed';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          // Get the user-friendly error message (usually at index 1)
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || 'Login failed';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Registration failed';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          // Get the user-friendly error message (usually at index 1)
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || 'Registration failed';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Confirm email with userId and confirmation code
   */
  confirmEmail(data: ConfirmEmailRequest): Observable<ConfirmEmailResponse> {
    return this.http.post<ConfirmEmailResponse>(`${this.apiUrl}/confirm-email`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Email confirmation failed';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          // Get the user-friendly error message (usually at index 1)
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || 'Email confirmation failed';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Request password reset via email
   */
  forgetPassword(data: ForgetPasswordRequest): Observable<ForgetPasswordResponse> {
    return this.http.post<ForgetPasswordResponse>(`${this.apiUrl}/ForgetPassword-Confirm`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Password reset request failed';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          // Get the user-friendly error message (usually at index 1)
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || 'Password reset request failed';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Reset password with userId, code, and new password
   */
  resetPassword(data: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/reset-password`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Password reset failed';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          // Get the user-friendly error message (usually at index 1)
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || 'Password reset failed';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get current user information
   */
  getUserInfo(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.baseUrl}/api/Account/Info`).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Failed to fetch user information';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || errorMessage;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Change user password
   */
  changePassword(data: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.http.put<ChangePasswordResponse>(`${this.baseUrl}/api/Account/Change-Password`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Failed to change password';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || errorMessage;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Update user information (firstName, lastName)
   */
  updateUserInfo(data: { firstName: string; lastName: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/Info`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Failed to update user information';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || errorMessage;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Upload profile image
   */
  uploadProfileImage(file: File): Observable<ProfileImageResponse> {
    const formData = new FormData();
    formData.append('Image', file);

    return this.http.post<ProfileImageResponse>(`${this.baseUrl}/api/Account/Profile-Image`, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Failed to upload profile image';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || errorMessage;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.title) {
          errorMessage = error.error.title;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authState.set({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Set token in storage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get stored user data
   */
  getSavedUser(): AuthResponse | null {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Set user in storage
   */
  private setUser(user: AuthResponse): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthResponse | null {
    return this.authState().user;
  }

  /**
   * Check if token is valid (exists and not expired)
   */
  private isTokenValid(): boolean {
    const token = this.getToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  /**
   * Check if JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      return true;
    }
  }
}
