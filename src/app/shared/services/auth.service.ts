import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, RefreshTokenRequest, RegisterRequest, RegisterResponse, ConfirmEmailRequest, ConfirmEmailResponse, ForgetPasswordRequest, ForgetPasswordResponse, ResetPasswordRequest, ResetPasswordResponse, UserInfo, ChangePasswordRequest, ChangePasswordResponse, ProfileImageResponse, AuthState } from '../Models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly apiUrl = `${this.baseUrl}/api/auth`;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly refreshTokenKey = 'refresh_token';
  authState = signal<AuthState>({
    isAuthenticated: this.isTokenValid(),
    user: this.getSavedUser(),
    token: this.getToken()
  });

  constructor(private http: HttpClient) {
    this.initializeAuthState();
  }

  /**
   * Login user with Google credential (ID token)
   */
  loginWithGoogle(credential: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/LoginWithGoogle`, { credential }).pipe(
      tap((response: AuthResponse) => {
        this.setTokens(response.token, response.refreshToken);
        this.setUser(response);
        this.authState.set({ isAuthenticated: true, user: response, token: response.token });
      }),
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Google login failed';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || 'Google login failed';
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
   * Register a user with Google credential (uses the same backend endpoint)
   */
  registerWithGoogle(credential: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/LoginWithGoogle`, { credential }).pipe(
      tap((response: AuthResponse) => {
        this.setTokens(response.token, response.refreshToken);
        this.setUser(response);
        this.authState.set({ isAuthenticated: true, user: response, token: response.token });
      }),
      catchError((error: HttpErrorResponse) => {
        // Extract error message from backend response
        let errorMessage = 'Google registration failed';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || error.error.title || 'Google registration failed';
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
   * Initialize auth state from stored data
   */
  private initializeAuthState(): void {
  const token = this.getToken();
  const user = this.getSavedUser();

  if (token && user && !this.isTokenExpired(token)) {
    this.authState.set({ isAuthenticated: true, user, token });
  } else if (this.getRefreshToken()) {
    // Don't refresh eagerly — just mark as authenticated optimistically.
    // The interceptor will handle the 401 and refresh when the first request fires.
    this.authState.set({ isAuthenticated: true, user, token: null });
  } else {
    this.authState.set({ isAuthenticated: false, user: null, token: null });
  }
  // ← No logout() call here. Never wipe tokens during initialization.
}

  /**
   * Login user with email and password
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl, { email, password }).pipe(
      tap((response: AuthResponse) => {
        this.setTokens(response.token, response.refreshToken);
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

  refreshToken(): Observable<AuthResponse> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/new-refresh`, { token, refreshToken }).pipe(
      tap((response) => {
        this.setTokens(response.token, response.refreshToken);
        this.setUser(response);
        this.authState.update(s => ({ ...s, token: response.token }));
      })
    );
  }
  


  /**
   * Logout user
   */
  logout(): void {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (token && refreshToken && !this.isTokenExpired(token)) {
      this.http.post(`${this.apiUrl}/revoke-refresh-token`, { token, refreshToken }).subscribe();
    }

    this.clearTokens();
  }

  clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.authState.set({ isAuthenticated: false, user: null, token: null });
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Set token in storage
   */
  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
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
  public isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Decode JWT token and extract payload
   */
  private decodeToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get roles from JWT token
   */
  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];

    const payload = this.decodeToken(token);
    if (!payload) return [];

    const roleClaims = [
      payload.roles,
      payload.role,
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    ];

    for (const roleValue of roleClaims) {
      if (Array.isArray(roleValue)) {
        return roleValue;
      }

      if (typeof roleValue === 'string' && roleValue.trim()) {
        return [roleValue];
      }
    }

    return [];
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('Admin');
  }
  isSeller(): boolean {
    return this.hasRole('Seller');
  }
}
