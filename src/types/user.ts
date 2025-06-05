export type Authority = 'TEMP' | 'USER' | 'TEACHER';

export type Resume = {
  name: string;
  type: 'LINK' | 'PDF';
  url: string;
};

export type UserProfile = {
  name: string;
  email: string;
  studentNumber: string;
  phoneNumber: string;
  authority: Authority;
  resume: Resume;
}; 