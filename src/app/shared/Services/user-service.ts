import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName?: string;
  profilePictureUrl?: string;
  createdAt?: string;
  isDisabled: boolean;
  roles?: string[];
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/api/User`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Failed to fetch users';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Failed to fetch user details';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Create a new user
   */
  createUser(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, data).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to create user';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || errorMessage;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Update user information
   */
  updateUser(id: string, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, data).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to update user';
        if (error.error?.Errors && Array.isArray(error.error.Errors)) {
          errorMessage = error.error.Errors[1] || error.error.Errors[0] || errorMessage;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Toggle user status (activate/deactivate)
   */
  toggleUserStatus(id: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/toggle-status`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Failed to toggle user status';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Unlock user
   */
  unlockUser(id: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/unlock`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Failed to unlock user';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
