import { Authority } from './auth';

export type Resume = {
  name: string;
  url: string;
};

export type Portfolio = {
  name: string;
  url: string;
};

export type UserProfile = {
  name: string;
  email: string;
  studentNumber: string;
  phoneNumber: string;
  authority: Authority;
  resume?: Resume;
  portfolio?: Portfolio;
}; 