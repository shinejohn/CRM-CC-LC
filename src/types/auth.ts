/**
 * Auth types for login, user, and auth state
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  smb_id?: string;
  role?: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}
