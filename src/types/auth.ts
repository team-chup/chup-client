export type Authority = 'TEMP' | 'USER' | 'TEACHER';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  authority: Authority;
}

export interface SignupRequest {
  name: string;
  email: string;
  studentNumber: string;
  phoneNumber: string;
  resume: {
    name: string;
    type: 'LINK' | 'PDF';
    url: string;
  };
} 