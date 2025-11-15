
export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  credits: number;
  createdAt: string;
  isAdmin?: boolean;
}

export interface PaymentRequest {
  id: number;
  userId: number;
  userEmail: string;
  plan: string;
  amount: number;
  utrCode: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type Theme = 'light' | 'dark';

export type Page = 'landing' | 'auth' | 'generator' | 'credits' | 'admin';
