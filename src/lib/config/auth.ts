type AuthConfig = {
  signInPage: string;
  protectedPages: readonly string[];
  publicPages: readonly string[];
};

export const authConfig: AuthConfig = {
  signInPage: '/signup',
  protectedPages: ['/signup', '/profile'],
  publicPages: ['/', '/login'],
} as const; 