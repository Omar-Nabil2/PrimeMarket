export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresIn: number;
  profilePictureUrl?: string;
  roles?: string[];
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

export interface UserProfileResponse {
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  createdAt?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ProfileImageResponse {
  message: string;
  profilePictureUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthResponse | null;
  token: string | null;
}
