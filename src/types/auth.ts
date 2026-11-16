export type UserRole = 'user' | 'instructor' | 'counsellor' | 'admin' | 'super_admin';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: 'active' | 'blocked';
  avatar_url?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  created_at?: string;
}

export interface AuthSessionState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}
