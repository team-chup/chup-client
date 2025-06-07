import { AxiosError } from 'axios';
import { instance } from '../lib/axios';
import { authConfig } from '../lib/config/auth';
import { setCookie, removeCookie } from '../lib/cookie';

const TIMEOUT = 10_000;

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

export const logout = () => {
  isRefreshing = false;
  refreshSubscribers = [];
  removeCookie('accessToken');
  removeCookie('refreshToken');
  window.location.href = authConfig.signInPage;
};

export const handleTokenRefresh = async (error: AxiosError) => {
  const originalRequest = error.config;
    
  if (!originalRequest) {
    return Promise.reject(error);
  }

  if (originalRequest.url === '/auth/refresh') {
    return Promise.reject(error);
  }

  if (error.response?.status === 401) {
    if (isRefreshing) {
      try {
        const token = await new Promise<string>((resolve, reject) => {
          refreshSubscribers.push(resolve);
          setTimeout(() => {
            reject(new Error('Refresh token timeout'));
          }, TIMEOUT);
        });
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    isRefreshing = true;

    try {
      const refreshToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('refreshToken='))
        ?.split('=')[1];

      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await instance.post<TokenResponse>('/auth/refresh', null, {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      setCookie('accessToken', accessToken);
      setCookie('refreshToken', newRefreshToken);

      isRefreshing = false;
      onRefreshed(accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return instance(originalRequest);
    } catch (error) {
      isRefreshing = false;
      logout();
      return Promise.reject(new Error('Token refresh failed'));
    }
  }

  return Promise.reject(error);
};
