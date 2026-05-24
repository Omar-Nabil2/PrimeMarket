export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ConfirmEmailRequest {
  userId: string;
  code: string;
}

export interface ConfirmEmailResponse {
  message: string;
  success: boolean;
}

export interface ForgetPasswordRequest {
  email: string;
}

export interface ForgetPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  userId: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthResponse | null;
  token: string | null;
}
