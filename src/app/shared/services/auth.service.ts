import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, AuthState } from '../Models/auth.model';

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
        console.error('Login failed:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
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
