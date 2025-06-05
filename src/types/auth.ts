import { SignupSchema } from '@/schemas/user';

export type Authority = 'TEMP' | 'USER' | 'TEACHER';

export type SignupRequest = SignupSchema;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  authority: 'TEMP' | 'USER' | 'ADMIN';
} 