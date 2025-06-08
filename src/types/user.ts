import { Authority } from './auth';

export type Resume = {
  name: string;
  type: 'LINK' | 'PDF';
  url: string;
  size?: number;
};

export type UserProfile = {
  name: string;
  email: string;
  studentNumber: string;
  phoneNumber: string;
  authority: Authority;
  resume: Resume;
}; 