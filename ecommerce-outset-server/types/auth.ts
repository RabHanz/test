export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  emailVerified?: Date;
  image?: string;
}

export interface Session {
  user: AuthUser;
  expires: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
} 